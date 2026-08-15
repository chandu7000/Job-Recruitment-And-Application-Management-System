import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import axiosClient, { setAuthenticationFailureHandler } from '../api/axiosClient'
import { getApiErrorMessage, mapApiError } from '../api/errorMapper'
import { clearAccessToken, getAccessToken, setAccessToken } from '../features/auth/services/tokenStore'
import { AUTH_TAB_ID_STORAGE_KEY, resetAuthTabIdForTests } from '../features/auth/services/authTabStore'

const originalAdapter = axiosClient.defaults.adapter

describe('Axios client foundation', () => {
    afterEach(() => {
        axiosClient.defaults.adapter = originalAdapter
        setAuthenticationFailureHandler(null)
        clearAccessToken()
        sessionStorage.removeItem(AUTH_TAB_ID_STORAGE_KEY)
        resetAuthTabIdForTests()
        vi.restoreAllMocks()
    })
    it('uses the approved base configuration', () => {
        expect(axiosClient.defaults.baseURL).toBe(
            import.meta.env.VITE_API_BASE_URL,
        )
        expect(axiosClient.defaults.withCredentials).toBe(true)
        expect(axiosClient.defaults.timeout).toBe(15000)
        expect(axiosClient.defaults.headers.common.Accept).toContain(
            'application/json',
        )
    })

    it('maps the backend error response structure', () => {
        const error = {
            response: {
                status: 422,
                data: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    errors: [{ field: 'email', message: 'Email is required' }],
                    requestId: 'request-123',
                },
            },
        }

        const mappedError = mapApiError(error)

        expect(mappedError.apiError).toEqual({
            status: 422,
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: [{ field: 'email', message: 'Email is required' }],
            requestId: 'request-123',
            isNetworkError: false,
        })

        expect(getApiErrorMessage(mappedError)).toBe('Validation failed')
    })

    it('adds the in-memory access token to protected requests', async () => {
        setAccessToken('memory-token')
        axiosClient.defaults.adapter = async (config) => ({
            data: {}, status: 200, statusText: 'OK', headers: {}, config,
        })

        const response = await axiosClient.get('/auth/me')
        expect(response.config.headers.Authorization).toBe('Bearer memory-token')
        expect(response.config.headers['X-Auth-Tab-Id']).toBeTruthy()
    })

    it('shares one refresh request across simultaneous 401 responses', async () => {
        setAccessToken('expired-token')
        const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: 'fresh-token' } } })
        axiosClient.defaults.adapter = async (config) => {
            if (config.headers.Authorization === 'Bearer fresh-token') {
                return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config }
            }
            return Promise.reject({ config, response: { status: 401, data: { code: 'ACCESS_TOKEN_EXPIRED' } } })
        }

        const [first, second] = await Promise.all([
            axiosClient.get('/protected/one'),
            axiosClient.get('/protected/two'),
        ])

        expect(first.status).toBe(200)
        expect(second.status).toBe(200)
        expect(refresh).toHaveBeenCalledTimes(1)
        expect(getAccessToken()).toBe('fresh-token')
    })


    it('refreshes once and retries the original protected request only once', async () => {
        setAccessToken('expired-token')
        const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: 'fresh-token' } } })
        let protectedAttempts = 0

        axiosClient.defaults.adapter = async (config) => {
            protectedAttempts += 1
            if (protectedAttempts === 1) {
                return Promise.reject({ config, response: { status: 401, data: { code: 'ACCESS_TOKEN_EXPIRED' } } })
            }
            return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }
        }

        const response = await axiosClient.get('/protected/retry-once')

        expect(response.status).toBe(200)
        expect(refresh).toHaveBeenCalledTimes(1)
        expect(protectedAttempts).toBe(2)
    })

    it('does not enter an infinite refresh loop when the retried request is still unauthorized', async () => {
        setAccessToken('expired-token')
        const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: 'fresh-token' } } })
        let protectedAttempts = 0

        axiosClient.defaults.adapter = (config) => {
            protectedAttempts += 1
            return Promise.reject({ config, response: { status: 401, data: { code: 'ACCESS_TOKEN_EXPIRED' } } })
        }

        await expect(axiosClient.get('/protected/still-unauthorized')).rejects.toBeDefined()
        expect(refresh).toHaveBeenCalledTimes(1)
        expect(protectedAttempts).toBe(2)
    })

    it('clears authentication when refresh fails', async () => {
        setAccessToken('expired-token')
        const onFailure = vi.fn()
        setAuthenticationFailureHandler(onFailure)
        vi.spyOn(axios, 'post').mockRejectedValue({ response: { status: 401, data: { code: 'INVALID_REFRESH_TOKEN' } } })
        axiosClient.defaults.adapter = (config) => Promise.reject({ config, response: { status: 401, data: {} } })

        await expect(axiosClient.get('/protected')).rejects.toBeDefined()
        expect(getAccessToken()).toBeNull()
        expect(onFailure).toHaveBeenCalledOnce()
    })
})
