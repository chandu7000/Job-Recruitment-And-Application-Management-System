const AUTH_TAB_ID_STORAGE_KEY = 'careerforge.authTabId'

let memoryTabId = null

function createAuthTabId() {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID()
  }

  return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getAuthTabId() {
  if (memoryTabId) {
    return memoryTabId
  }

  try {
    const existingTabId = sessionStorage.getItem(AUTH_TAB_ID_STORAGE_KEY)

    if (existingTabId) {
      memoryTabId = existingTabId
      return memoryTabId
    }

    memoryTabId = createAuthTabId()
    sessionStorage.setItem(AUTH_TAB_ID_STORAGE_KEY, memoryTabId)
    return memoryTabId
  } catch {
    memoryTabId = createAuthTabId()
    return memoryTabId
  }
}

export function resetAuthTabIdForTests() {
  memoryTabId = null
}

export { AUTH_TAB_ID_STORAGE_KEY }
