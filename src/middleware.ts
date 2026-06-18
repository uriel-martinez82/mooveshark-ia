import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn   = !!req.auth
  const role         = (req.auth?.user as Record<string, unknown>)?.role as string | undefined

  // Proteger /admin — solo admins
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/auth/login?role=admin', req.url))
    if (role !== 'admin') return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Proteger /dashboard — solo clients
  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/auth/login', req.url))
    if (role !== 'client') return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Proteger /change-password — solo clients logueados
  if (pathname.startsWith('/change-password')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/auth/login', req.url))
    if (role !== 'client') return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Redirigir si ya está logueado
  if (pathname.startsWith('/auth/login') && isLoggedIn) {
    return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/auth/login', '/change-password'],
}