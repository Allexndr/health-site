'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Simplified auth types for demo
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'staff'
  clinicId: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Demo user for testing
  const demoUser: User = {
    id: 'demo_user',
    email: 'dental_clinic_1@demo.com',
    name: 'Стоматологическая клиника №1',
    role: 'admin',
    clinicId: 'dental_clinic_1'
  }

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true)
    try {
      // Demo login - accept dental_clinic_1 / demo123
      if (credentials.username === 'dental_clinic_1' && credentials.password === 'demo123') {
        setUser(demoUser)
        localStorage.setItem('auth_user', JSON.stringify(demoUser))
        router.push('/dashboard')
      } else {
        throw new Error('Неверные учетные данные')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
    router.push('/')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout
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