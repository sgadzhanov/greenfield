import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeStats, todayIn } from '@/lib/stats'

export type Walk = { id: string; walked_on: string; minutes: number | null; distance_km: number | null }

const PAGE = 1000 // PostgREST returns at most this many rows per request

/**
 * Everything a signed-in screen needs, and the server-side identity check: every signed-in page
 * and action calls this, and it redirects to login when the session is gone.
 */
export async function fetchState() {
  await connection() // per-request data: never prerender or cache it
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error?.name === 'AuthRetryableFetchError') throw new Error('auth backend unreachable')
  if (!data?.claims) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('display_name, timezone').single()
  if (!profile) throw new Error('profile not found')

  const walks: Walk[] = []
  for (let from = 0; ; from += PAGE) {
    const { data: page, error } = await supabase
      .from('walks')
      .select('id, walked_on, minutes, distance_km')
      .order('walked_on')
      .order('created_at')
      .range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    walks.push(...page)
    if (page.length < PAGE) break
  }

  const now = new Date()
  const today = todayIn(profile.timezone, now)
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: profile.timezone, hour: 'numeric', hourCycle: 'h23' }).format(now))
  const km = walks.reduce((sum, w) => sum + (w.distance_km ?? 0), 0)
  const stats = computeStats(walks.map((w) => w.walked_on), today, km)

  return { supabase, userId: data.claims.sub, profile, walks, today, hoursLeft: 24 - hour, km, stats }
}
