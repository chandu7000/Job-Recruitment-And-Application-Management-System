import { afterEach, describe, expect, it } from 'vitest'
import {
  AUTH_TAB_ID_STORAGE_KEY,
  getAuthTabId,
  resetAuthTabIdForTests,
} from '../features/auth/services/authTabStore'

describe('auth tab store', () => {
  afterEach(() => {
    sessionStorage.removeItem(AUTH_TAB_ID_STORAGE_KEY)
    resetAuthTabIdForTests()
  })

  it('keeps a stable identifier for the current browser tab', () => {
    const first = getAuthTabId()
    const second = getAuthTabId()

    expect(first).toBeTruthy()
    expect(second).toBe(first)
    expect(sessionStorage.getItem(AUTH_TAB_ID_STORAGE_KEY)).toBe(first)
  })
})
