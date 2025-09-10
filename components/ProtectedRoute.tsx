import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/providers/AuthProvider'
import type { UserRole } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (!isLoading && user && requiredRole) {
      const roleHierarchy: Record<UserRole, number> = {
        admin: 3,
        doctor: 2,
        staff: 1,
      }

      if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
        router.push('/dashboard')
      }
    }
  }, [isLoading, user, requiredRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && user) {
    const roleHierarchy: Record<UserRole, number> = {
      admin: 3,
      doctor: 2,
      staff: 1,
    }

    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      return null
    }
  }

  return <>{children}</>
} 