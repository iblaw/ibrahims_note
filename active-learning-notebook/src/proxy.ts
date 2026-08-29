import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Local dev fallback: if Supabase env vars are not set, skip auth checks so dev server can run.
  // In production, these env vars should always be provided and this guard will be skipped.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>            supabaseResponse.cookies.set(name, value, options)          )        },      },    }  )
  const {    data: { user },  } = await supabase.auth.getUser()
  const isInternalRoute =    request.nextUrl.pathname.startsWith('/notes') ||    request.nextUrl.pathname.startsWith('/courses') ||    request.nextUrl.pathname.startsWith('/archive') ||    request.nextUrl.pathname.startsWith('/review')  if (isInternalRoute && !user) {    const url = request.nextUrl.clone()    url.pathname = '/login'    return NextResponse.redirect(url)  }  if (user && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login')) {    const url = request.nextUrl.clone()    url.pathname = '/notes'    return NextResponse.redirect(url)  }  return supabaseResponse}

export const config = {  matcher: [    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',  ],}
