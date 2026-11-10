'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { FormState } from '@/components/form'
import { createClient } from '@/lib/supabase/server'

const MIN_PASSWORD = 8 // keep in sync with minimum_password_length in Supabase Auth settings
const PENDING = 'pending_email'

const MESSAGES: Record<string, string> = {
  weak_password: `Паролата е твърде слаба. Избери поне ${MIN_PASSWORD} знака.`,
  same_password: 'Новата парола трябва да е различна от старата.',
  email_address_invalid: 'Въведи валиден имейл.',
  over_email_send_rate_limit: 'Твърде много имейли за кратко време. Опитай пак след минута.',
  over_request_rate_limit: 'Твърде много опити. Изчакай малко и опитай пак.',
}
const message = (error: { code?: string }) => MESSAGES[error.code ?? ''] ?? 'Нещо се обърка. Опитай пак.'

/** Where email links come back to: this deployment's /auth/confirm. Supabase only honours it if
 * it matches the project's Redirect URLs allow-list, otherwise it falls back to the Site URL. */
async function confirmUrl(next?: string) {
  const h = await headers()
  const origin = h.get('origin') ?? `https://${h.get('host')}`
  return `${origin}/auth/confirm${next ? `?next=${next}` : ''}`
}

const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim()
const validEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email)

async function rememberPending(email: string) {
  ;(await cookies()).set(PENDING, email, { httpOnly: true, sameSite: 'lax', maxAge: 3600, path: '/' })
}

export async function register(_: FormState, data: FormData): Promise<FormState> {
  const name = text(data, 'name')
  const email = text(data, 'email')
  const password = String(data.get('password') ?? '')
  if (!name || name.length > 50) return { error: 'Въведи име до 50 знака.' }
  if (!validEmail(email)) return { error: MESSAGES.email_address_invalid }
  if (password.length < MIN_PASSWORD) return { error: MESSAGES.weak_password }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: await confirmUrl(), data: { display_name: name, timezone: text(data, 'timezone') } },
  })
  if (error) return { error: message(error) }
  // Same screen whether or not the email was already registered.
  await rememberPending(email)
  redirect('/check-email')
}

export async function resend(): Promise<FormState> {
  const email = (await cookies()).get(PENDING)?.value
  if (!email) return { error: 'Не знаем на кой имейл да изпратим. Регистрирай се отново.' }
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: await confirmUrl() } })
  if (error) return { error: message(error) }
  return { ok: 'Изпратихме ти нов имейл.', at: Date.now() }
}

export async function resendTo(_: FormState, data: FormData): Promise<FormState> {
  const email = text(data, 'email')
  if (!validEmail(email)) return { error: MESSAGES.email_address_invalid }
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: await confirmUrl() } })
  if (error?.code?.startsWith('over_')) return { error: message(error) }
  return { ok: 'Ако има непотвърдена регистрация с този имейл, изпратихме нов линк.' }
}

export async function login(_: FormState, data: FormData): Promise<FormState> {
  const email = text(data, 'email')
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password: String(data.get('password') ?? '') })
  if (error?.code === 'email_not_confirmed') {
    await rememberPending(email)
    redirect('/check-email')
  }
  if (error?.code === 'invalid_credentials') return { error: 'Невалиден имейл или парола.' }
  if (error) return { error: message(error) }
  redirect('/today')
}

export async function forgotPassword(_: FormState, data: FormData): Promise<FormState> {
  const email = text(data, 'email')
  if (!validEmail(email)) return { error: MESSAGES.email_address_invalid }
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: await confirmUrl('/update-password') })
  if (error?.code?.startsWith('over_')) return { error: message(error) }
  return { ok: 'Ако има профил с този имейл, изпратихме линк за нова парола. Валиден е един час.' }
}

export async function updatePassword(_: FormState, data: FormData): Promise<FormState> {
  const password = String(data.get('password') ?? '')
  if (password.length < MIN_PASSWORD) return { error: MESSAGES.weak_password }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error?.code === 'session_not_found' || error?.name === 'AuthSessionMissingError') redirect('/login')
  if (error) return { error: message(error) }
  await supabase.auth.signOut()
  redirect('/login?m=reset')
}
