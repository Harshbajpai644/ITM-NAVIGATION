import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { adminApi } from '../api/client'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const raw = localStorage.getItem('itm_admin_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    try {
      const { data } = await adminApi.login(username, password)
      localStorage.setItem('itm_access_token', data.tokens.access)
      localStorage.setItem('itm_refresh_token', data.tokens.refresh)
      localStorage.setItem('itm_admin_user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('itm_access_token')
    localStorage.removeItem('itm_refresh_token')
    localStorage.removeItem('itm_admin_user')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}