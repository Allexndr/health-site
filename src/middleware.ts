import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from './lib/auth'

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ]

  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const user = await getAuthUser(request)

  // If not authenticated, redirect to login
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // User is authenticated, allow access
  return NextResponse.next()
}

// Configure paths that should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /favicon.ico, /robots.txt (static files)
     */
    '/((?!_next|static|favicon.ico|robots.txt).*)',
  ],
} 