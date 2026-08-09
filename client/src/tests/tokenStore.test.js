import { afterEach, describe, expect, it } from 'vitest'
import { clearAccessToken, getAccessToken, setAccessToken } from '../features/auth/services/tokenStore'

describe('in-memory access-token store', () => {
  afterEach(clearAccessToken)

  it('stores and clears an access token only in module memory', () => {
    setAccessToken('access-token')
    expect(getAccessToken()).toBe('access-token')
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(sessionStorage.getItem('accessToken')).toBeNull()
    clearAccessToken()
    expect(getAccessToken()).toBeNull()
  })

  it('normalizes invalid values to null', () => {
    setAccessToken('')
    expect(getAccessToken()).toBeNull()
  })
})
