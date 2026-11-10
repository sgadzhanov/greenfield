import type { EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Email links land here in one of two shapes:
//  - /auth/confirm?token_hash=…&type=email|recovery   our own templates (any device)
//  - /auth/confirm?code=…[&next=…]                   Supabase's default templates, after
//    Supabase verified the link itself (PKCE: only in the browser that asked for the email)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const token_hash = params.get('token_hash')
  const type = params.get('type') as EmailOtpType | null
  const code = params.get('code')
  // Allow-list, so the link can never send anyone off-site.
  const recovery = type === 'recovery' || params.get('next') === '/update-password'

  const supabase = await createClient()
  const { error } =
    token_hash && type ? await supabase.auth.verifyOtp({ type, token_hash })
    : code ? await supabase.auth.exchangeCodeForSession(code)
    : { error: true }

  if (error) redirect('/auth/error')
  redirect(recovery ? '/update-password' : '/today?welcome=1')
}
