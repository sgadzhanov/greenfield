import { Bar } from '@/components/bar'
import { fetchState } from '@/lib/data'
import { ShareButton } from './share'

export default async function Badges() {
  const { stats } = await fetchState()
  const { level, points, badges } = stats
  const earned = badges.filter((b) => b.earned).length

  return (
    <>
      <h1 className="text-2xl font-extrabold">Постижения</h1>

      <section className="card">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ниво</p>
        <p className="text-2xl font-extrabold">{level.name}</p>
        <p className="mt-1 text-muted">{points} точки</p>
        {level.nextAt && (
          <>
            <Bar value={points} max={level.nextAt} label="Напредък до следващото ниво" />
            <p className="mt-1 text-sm text-muted">Още {level.nextAt - points} точки до следващото ниво</p>
          </>
        )}
      </section>

      <ShareButton />

      <h2 className="mt-2 text-lg font-bold">Значки · {earned} от {badges.length}</h2>
      <ul className="grid grid-cols-2 gap-3">
        {badges.map((b) => (
          <li key={b.id} className={`card flex flex-col items-center gap-1 px-3 text-center ${b.earned ? '' : 'opacity-50'}`}>
            <span className={`text-4xl ${b.earned ? '' : 'grayscale'}`} aria-hidden>{b.icon}</span>
            <span className="font-bold">{b.title}</span>
            <span className="text-xs text-muted">{b.earned ? 'Спечелена ✓' : b.hint}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
