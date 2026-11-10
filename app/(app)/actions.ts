'use server'

import { revalidatePath } from 'next/cache'
import { redirect, unstable_rethrow } from 'next/navigation'
import type { FormState } from '@/components/form'
import { fetchState } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

const FAIL: FormState = { error: 'Не успяхме да запишем. Опитай пак.' }

/** fetchState, but a backend outage becomes null (shown inline) instead of an error page. */
async function state() {
  try {
    return await fetchState()
  } catch (error) {
    unstable_rethrow(error) // lets the redirect to /login through
    return null
  }
}

/** '' → null (not given), bad value → undefined. Accepts a decimal comma. */
function amount(data: FormData, key: string, max: number, integer: boolean) {
  const raw = String(data.get(key) ?? '').trim().replace(',', '.')
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 && n <= max && (!integer || Number.isInteger(n)) ? n : undefined
}

function details(data: FormData) {
  const minutes = amount(data, 'minutes', 1440, true)
  const distance_km = amount(data, 'km', 100, false)
  if (minutes === undefined) return { error: 'Минутите трябва да са цяло число от 1 до 1440.' }
  if (distance_km === undefined) return { error: 'Километрите трябва да са число до 100.' }
  return { minutes, distance_km }
}

export async function logWalk(_: FormState, data: FormData): Promise<FormState> {
  const before = await state()
  if (!before) return FAIL
  const day = String(data.get('day') ?? before.today)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day))) return FAIL
  if (day > before.today) return { error: 'Не може да записваш бъдещи дни.' }
  const fields = details(data)
  if ('error' in fields) return fields

  const { error } = await before.supabase.from('walks').insert({ walked_on: day, ...fields })
  if (error) return FAIL
  revalidatePath('/', 'layout')

  const after = await state()
  if (!after) return { ok: 'Записано!' }
  const had = new Set(before.stats.badges.filter((b) => b.earned).map((b) => b.id))
  const earned = after.stats.badges.filter((b) => b.earned && !had.has(b.id)).map((b) => `${b.icon} ${b.title}`)
  return { ok: 'Записано!', at: Date.now(), earned }
}

export async function saveWalk(_: FormState, data: FormData): Promise<FormState> {
  const current = await state()
  if (!current) return FAIL
  const { supabase } = current
  const fields = details(data)
  if ('error' in fields) return fields
  const { data: rows, error } = await supabase.from('walks').update(fields).eq('id', String(data.get('id'))).select('id')
  if (error || !rows.length) return FAIL
  revalidatePath('/', 'layout')
  return { ok: 'Запазено.' }
}

export async function deleteWalk(_: FormState, data: FormData): Promise<FormState> {
  const current = await state()
  if (!current) return FAIL
  const { supabase } = current
  const { data: rows, error } = await supabase.from('walks').delete().eq('id', String(data.get('id'))).select('id')
  if (error || !rows.length) return { error: 'Не успяхме да изтрием. Опитай пак.' }
  revalidatePath('/', 'layout')
  return null
}

export async function updateName(_: FormState, data: FormData): Promise<FormState> {
  const name = String(data.get('name') ?? '').trim()
  if (!name || name.length > 50) return { error: 'Въведи име до 50 знака.' }
  const current = await state()
  if (!current) return FAIL
  const { supabase, userId } = current
  const { data: rows, error } = await supabase.from('profiles').update({ display_name: name }).eq('id', userId).select('id')
  if (error || !rows.length) return FAIL
  revalidatePath('/', 'layout')
  return { ok: 'Името е сменено.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
