import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SIGNED_IN_ONLY = ['/today', '/badges', '/profile', '/share', '/update-password']
const SIGNED_OUT_ONLY = ['/', '/login', '/register']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list, headers) {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  // Refreshes an expired session and verifies the token. Do not remove.
  const { data, error } = await supabase.auth.getClaims()
  if (error?.name === 'AuthRetryableFetchError') return response // backend unreachable: not a logout
  const signedIn = Boolean(data?.claims)
  const path = request.nextUrl.pathname

  // Supabase falls back to the Site URL (our "/") when a redirect is not allow-listed.
  if (path === '/' && request.nextUrl.searchParams.has('code')) {
    const confirm = new URL('/auth/confirm', request.url)
    confirm.search = request.nextUrl.search
    return NextResponse.redirect(confirm)
  }

  const target =
    !signedIn && SIGNED_IN_ONLY.some((p) => path.startsWith(p)) ? '/login'
    : signedIn && SIGNED_OUT_ONLY.includes(path) ? '/today'
    : null
  if (!target) return response

  const redirect = NextResponse.redirect(new URL(target, request.url))
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
  return redirect
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icon.svg|manifest.webmanifest|.*\\.(?:png|jpg|svg|ico|ttf|woff)$).*)'],
}
