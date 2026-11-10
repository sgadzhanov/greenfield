import { days, plural } from '@/lib/bg'
import { fetchState } from '@/lib/data'
import { addDays, FREEZE_EVERY, MAX_FREEZES } from '@/lib/stats'
import { Calendar } from './calendar'
import { LogWalk } from './log-walk'

export default async function Today({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams
  const { profile, walks, today, hoursLeft, stats } = await fetchState()
  const thisMonth = today.slice(0, 7)
  const month = m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) && m <= thisMonth ? m : thisMonth

  const note =
    stats.frozen.includes(addDays(today, -1)) ? 'Вчера използва почивен ден – серията ти е жива. ❄️'
    : stats.streak > 0 && hoursLeft <= 6 ? `Остават ${plural(hoursLeft, 'час', 'часа')} да запазиш серията.`
    : stats.streak > 0 ? 'Една разходка днес и серията продължава.'
    : stats.longest > 0 ? `Нова серия започва днес. Рекордът ти е ${days(stats.longest)}.`
    : 'Запиши първата си разходка с едно докосване.'

  const { challenge } = stats
  return (
    <>
      <h1 className="text-2xl font-extrabold">Здравей, {profile.display_name}!</h1>

      <LogWalk today={today} streak={stats.streak} walkedToday={stats.walkedToday} note={note} />

      <section className="grid grid-cols-3 gap-3 text-center">
        {[
          ['❄️', stats.freezes, 'почивни дни'],
          ['🏆', stats.longest, 'най-дълга серия'],
          ['📅', stats.activeDays, 'активни дни'],
        ].map(([icon, value, label]) => (
          <div key={label} className="card px-2 py-4">
            <p aria-hidden>{icon}</p>
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </section>
      <p className="px-1 text-xs text-muted">
        На всеки {FREEZE_EVERY} дни подред печелиш почивен ден (най-много {MAX_FREEZES}). Той пази серията, ако пропуснеш ден.
      </p>

      <section className="card">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Предизвикателство на седмицата</p>
        <p className="mt-1 text-lg font-bold">{challenge.title}</p>
        <progress className="mt-3 h-3 w-full accent-primary" value={challenge.progress} max={challenge.target} />
        <p className="mt-1 text-sm text-muted">
          {challenge.done ? 'Изпълнено! +50 точки 🎉' : `${challenge.progress} от ${challenge.target}`}
        </p>
      </section>

      <Calendar month={month} today={today} walks={walks.filter((w) => w.walked_on.startsWith(month))} frozen={stats.frozen} />
    </>
  )
}
