'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restore session from sessionStorage
    const stored = sessionStorage.getItem('skibidi_user')
    if (stored) {
      try {
        setCurrentUserState(JSON.parse(stored))
      } catch {}
    }
    setIsLoading(false)
  }, [])

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user)
    if (user) {
      sessionStorage.setItem('skibidi_user', JSON.stringify(user))
    } else {
      sessionStorage.removeItem('skibidi_user')
    }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
