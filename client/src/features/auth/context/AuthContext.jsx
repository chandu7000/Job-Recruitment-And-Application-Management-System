import { useCallback, useEffect, useMemo, useState } from 'react'
import { setAuthenticationFailureHandler } from '../../../api/axiosClient'
import { authApi } from '../services/authApi'
import { AuthContext } from './AuthContextDefinition'
import {
  clearAccessToken,
  setAccessToken,
} from '../services/tokenStore'

const emptyAuthenticationState = {
  user: null,
  role: null,
  status: null,
  permissions: [],
  isAuthenticated: false,
}

function stateFromUser(user) {
  return {
    user,
    role: user?.role ?? null,
    status: user?.status ?? null,
    permissions: Array.isArray(user?.permissions) ? user.permissions : [],
    isAuthenticated: Boolean(user),
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(emptyAuthenticationState)
  const [isInitializing, setIsInitializing] = useState(true)

  const clearAuthentication = useCallback(() => {
    clearAccessToken()
    setAuthState(emptyAuthenticationState)
  }, [])

  useEffect(() => {
    setAuthenticationFailureHandler(clearAuthentication)
    return () => setAuthenticationFailureHandler(null)
  }, [clearAuthentication])

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      try {
        const refreshResult = await authApi.refresh()
        setAccessToken(refreshResult.accessToken)
        const user = await authApi.getCurrentUser()

        if (isMounted) {
          setAuthState(stateFromUser(user))
        }
      } catch {
        if (isMounted) {
          clearAccessToken()
          setAuthState(emptyAuthenticationState)
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials)
    setAccessToken(result.accessToken)
    setAuthState(stateFromUser(result.user))
    return result.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuthentication()
    }
  }, [clearAuthentication])

  const logoutAll = useCallback(async () => {
    await authApi.logoutAll()
    clearAuthentication()
  }, [clearAuthentication])

  const forceLogout = useCallback(() => {
    clearAuthentication()
  }, [clearAuthentication])

  const value = useMemo(
    () => ({
      ...authState,
      isInitializing,
      login,
      logout,
      logoutAll,
      forceLogout,
    }),
    [authState, forceLogout, isInitializing, login, logout, logoutAll],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
