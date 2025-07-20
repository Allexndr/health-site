'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { apiClient, Clinic, LoginRequest } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: Clinic | null
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const response = await apiClient.getCurrentClinic()
          if (response.data) {
            setUser(response.data)
          } else {
            // Token is invalid, clear it
            apiClient.logout()
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          apiClient.logout()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.login(credentials)
      
      if (response.error) {
        return { success: false, error: response.error }
      }

      // Get user info after successful login
      const userResponse = await apiClient.getCurrentClinic()
      if (userResponse.data) {
        setUser(userResponse.data)
        return { success: true }
      } else {
        return { success: false, error: 'Failed to get user info' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    }
  }

  const logout = () => {
    apiClient.logout()
    setUser(null)
    router.push('/auth/login')
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 