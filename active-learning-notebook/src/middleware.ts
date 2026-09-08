import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;

  // Allow guest access to these specific public routes
  const isPublicShareRoute = 
    pathname.match(/^\/notes\/[^/]+$/) || 
    pathname.match(/^\/notes\/[^/]+\/quiz$/) ||
    pathname.match(/^\/notes\/[^/]+\/flashcards$/) ||
    pathname.match(/^\/review\/exam\/[^/]+$/);

  // Protect internal routes
  const isInternalRoute = 
    pathname.startsWith('/notes') ||
    pathname.startsWith('/courses') ||
    pathname.startsWith('/archive') ||
    pathname.startsWith('/review');

  if (isInternalRoute && !isPublicShareRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and visits root or login, redirect to /notes
  if (user && (pathname === '/' || pathname === '/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/notes'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
