import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
<<<<<<< HEAD

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Добавляем заголовки для предотвращения кэширования
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
=======
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
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
  ],
} 