
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  
  const isLoginPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')
  
  // Define protected routes
  // For now, let's say /dashboard is protected
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/experience')
  
  // 1. Unauthenticated user trying to access protected routes
  if (isProtectedRoute && !token) {
     const url = new URL('/login', request.url)
     // Optional: Save the url to redirect back after login
     return NextResponse.redirect(url)
  }

  // 2. Authenticated user trying to access public auth pages (login/signup)
  if (isLoginPage && token) {
     return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Only run on specific paths to avoid matching static files, api, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
