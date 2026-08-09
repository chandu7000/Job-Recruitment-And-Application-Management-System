import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import axiosClient, { setAuthenticationFailureHandler } from '../api/axiosClient'
import { getApiErrorMessage, mapApiError } from '../api/errorMapper'
import { clearAccessToken, getAccessToken, setAccessToken } from '../features/auth/services/tokenStore'

const originalAdapter = axiosClient.defaults.adapter

describe('Axios client foundation', () => {
    afterEach(() => {
        axiosClient.defaults.adapter = originalAdapter
        setAuthenticationFailureHandler(null)
        clearAccessToken()
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
