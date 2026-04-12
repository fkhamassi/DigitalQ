// src/context/AuthContext.jsx
// Gestion de l'état d'authentification agent/admin

import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Restaurer depuis localStorage si disponible
    try {
      const saved = localStorage.getItem('dq_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password })
    const { token, user: userData } = response.data

    localStorage.setItem('dq_token', token)
    localStorage.setItem('dq_user', JSON.stringify(userData))
    setUser(userData)

    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // Ignorer les erreurs de logout
    } finally {
      localStorage.removeItem('dq_token')
      localStorage.removeItem('dq_user')
      setUser(null)
    }
  }, [])

  const isAgent = user?.role === 'agent'
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAgent, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return context
}
