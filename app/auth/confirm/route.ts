import type { EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Email links land here: /auth/confirm?token_hash=…&type=email|recovery[&next=/path]
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const token_hash = params.get('token_hash')
  const type = params.get('type') as EmailOtpType | null
  const next = params.get('next') ?? '/today'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    // Only same-site paths, never an absolute or protocol-relative URL.
    if (!error) redirect(/^\/[^/\\]/.test(next) ? next : '/today')
  }
  redirect('/auth/error')
}
