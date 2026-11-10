// All game rules, derived from the list of days with a walk. Pure TypeScript, no imports,
// so the future mobile app can use this file unchanged.
// ponytail: recomputed from full history on every call; cache if a user ever has >10k walks.

export type Day = string // YYYY-MM-DD

const DAY_MS = 86_400_000
const utc = (d: Day) => Date.parse(d + 'T00:00:00Z')

export const addDays = (d: Day, n: number): Day => new Date(utc(d) + n * DAY_MS).toISOString().slice(0, 10)
/** 0 = Monday … 6 = Sunday */
export const weekday = (d: Day) => (new Date(utc(d)).getUTCDay() + 6) % 7
export const weekStart = (d: Day): Day => addDays(d, -weekday(d))
export const todayIn = (timeZone: string, now = new Date()): Day =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)

export const FREEZE_EVERY = 7
export const MAX_FREEZES = 2
const POINTS_PER_DAY = 10
const CHALLENGE_POINTS = 50
const MILESTONES: Record<number, number> = { 7: 50, 30: 200, 100: 500, 365: 2000 }
const LEVELS: [number, string][] = [
  [0, 'Новак'],
  [200, 'Разходкаджия'],
  [1000, 'Пътешественик'],
  [3000, 'Маратонец'],
  [8000, 'Легенда'],
]

type Week = boolean[] // 7 flags, Monday first
const count = (w: Week) => w.filter(Boolean).length
const longestRun = (w: Week) => Math.max(...w.map(Number).join('').split('0').map((run) => run.length))

// ponytail: past weeks are re-scored with this list, so reordering it changes old points.
const CHALLENGES: { title: string; target: number; progress: (w: Week) => number }[] = [
  { title: 'Разходи се в 5 различни дни', target: 5, progress: count },
  { title: 'Разходи се и в събота, и в неделя', target: 2, progress: (w) => count(w.slice(5)) },
  { title: 'Направи 3 поредни дни', target: 3, progress: longestRun },
  { title: 'Започни силно: понеделник, вторник и сряда', target: 3, progress: (w) => count(w.slice(0, 3)) },
]
const challengeFor = (monday: Day) => CHALLENGES[Math.round((utc(monday) - utc('1970-01-05')) / (7 * DAY_MS)) % CHALLENGES.length]

export type Badge = { id: string; icon: string; title: string; hint: string; earned: boolean }

export function computeStats(walkDays: Day[], today: Day, totalKm = 0) {
  const active = new Set(walkDays.filter((d) => d <= today))
  const first = [...active].sort()[0]

  let streak = 0, longest = 0, freezes = 0, points = 0
  let comeback = false, weekend = false
  let lastActive: Day | null = null
  const frozen: Day[] = []

  for (let d = first; d && d <= today; d = addDays(d, 1)) {
    if (active.has(d)) {
      if (lastActive && utc(d) - utc(lastActive) >= 8 * DAY_MS) comeback = true
      streak++
      points += POINTS_PER_DAY + (MILESTONES[streak] ?? 0)
      if (streak % FREEZE_EVERY === 0 && freezes < MAX_FREEZES) freezes++
      longest = Math.max(longest, streak)
      lastActive = d
    } else if (d === today) {
      // the day is not over yet
    } else if (streak > 0 && freezes > 0) {
      freezes--
      frozen.push(d)
    } else {
      streak = 0
    }
  }

  const weekOf = (monday: Day): Week => Array.from({ length: 7 }, (_, i) => active.has(addDays(monday, i)))
  const thisMonday = weekStart(today)
  for (let m = first ? weekStart(first) : thisMonday; m <= thisMonday; m = addDays(m, 7)) {
    const w = weekOf(m)
    const c = challengeFor(m)
    if (c.progress(w) >= c.target) points += CHALLENGE_POINTS
    if (w[5] && w[6]) weekend = true
  }

  const current = challengeFor(thisMonday)
  const progress = Math.min(current.progress(weekOf(thisMonday)), current.target)
  const levelIndex = LEVELS.findLastIndex(([min]) => points >= min)
  const total = active.size

  const badges: Badge[] = [
    { id: 'first', icon: '👟', title: 'Първа крачка', hint: 'Запиши първата си разходка', earned: total >= 1 },
    { id: 'streak3', icon: '🔥', title: 'Три поредни', hint: '3 дни подред', earned: longest >= 3 },
    { id: 'streak7', icon: '📅', title: 'Цяла седмица', hint: '7 дни подред', earned: longest >= 7 },
    { id: 'streak14', icon: '💪', title: 'Две седмици', hint: '14 дни подред', earned: longest >= 14 },
    { id: 'streak30', icon: '🏅', title: 'Месец постоянство', hint: '30 дни подред', earned: longest >= 30 },
    { id: 'streak100', icon: '💯', title: 'Стотачка', hint: '100 дни подред', earned: longest >= 100 },
    { id: 'days10', icon: '🌱', title: '10 активни дни', hint: 'Общо 10 дни с разходка', earned: total >= 10 },
    { id: 'days50', icon: '🌿', title: '50 активни дни', hint: 'Общо 50 дни с разходка', earned: total >= 50 },
    { id: 'days100', icon: '🌳', title: '100 активни дни', hint: 'Общо 100 дни с разходка', earned: total >= 100 },
    { id: 'days365', icon: '🏔️', title: 'Година на крак', hint: 'Общо 365 дни с разходка', earned: total >= 365 },
    { id: 'weekend', icon: '☀️', title: 'Уикенд навън', hint: 'Събота и неделя в една седмица', earned: weekend },
    { id: 'comeback', icon: '🌅', title: 'Завръщане', hint: 'Върни се след пауза от 7+ дни', earned: comeback },
    { id: 'marathon', icon: '🏃', title: 'Маратон', hint: 'Общо 42 км записани', earned: totalKm >= 42 },
  ]

  return {
    streak,
    longest,
    activeDays: total,
    freezes,
    frozen,
    points,
    walkedToday: active.has(today),
    level: { name: LEVELS[levelIndex][1], nextAt: LEVELS[levelIndex + 1]?.[0] ?? null },
    challenge: { title: current.title, target: current.target, progress, done: progress >= current.target },
    badges,
  }
}

export type Stats = ReturnType<typeof computeStats>
