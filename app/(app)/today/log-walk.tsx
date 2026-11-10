'use client'

import { useActionState } from 'react'
import { days } from '@/lib/bg'
import { logWalk } from '../actions'

export function LogWalk({ streak, walkedToday, note }: {
  streak: number
  walkedToday: boolean
  note: string
}) {
  const [state, action, pending] = useActionState(logWalk, null)
  // Optimistic while the save is in flight; falls back to the real values if it fails.
  const done = walkedToday || pending
  const shown = streak + (pending && !walkedToday ? 1 : 0)

  return (
    <section className="card flex flex-col items-center gap-3 text-center">
      <p className={`text-6xl ${done ? '' : 'grayscale'}`} aria-hidden>🔥</p>
      <p key={shown} className="pop text-7xl font-extrabold leading-none text-flame">{shown}</p>
      <p className="text-lg font-semibold">{days(shown).split(' ')[1]} подред</p>
      <p role="status" className="text-muted">{done ? 'Днес е отбелязан. Браво!' : note}</p>

      {state?.earned?.length ? (
        <div key={state.at} role="status" className="pop w-full rounded-2xl bg-primary/10 p-3 font-semibold text-primary">
          Нова значка: {state.earned.join(', ')} 🎉
        </div>
      ) : null}
      {state?.error && <p role="alert" className="font-medium text-danger">{state.error}</p>}

      <form action={action} className="w-full">
        <button className={`${walkedToday ? 'btn-ghost' : 'btn'} w-full text-lg`} disabled={pending}>
          {walkedToday ? '＋ Още една разходка днес' : 'Разходих се днес'}
        </button>
      </form>
    </section>
  )
}
