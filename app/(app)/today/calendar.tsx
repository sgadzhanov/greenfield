'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { Field, Form } from '@/components/form'
import { dayTitle, monthTitle, plural } from '@/lib/bg'
import type { Walk } from '@/lib/data'
import { addDays, weekday } from '@/lib/stats'
import { deleteWalk, logWalk, saveWalk } from '../actions'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const shift = (month: string, by: number) => {
  const d = new Date(month + '-01T00:00:00Z')
  d.setUTCMonth(d.getUTCMonth() + by)
  return d.toISOString().slice(0, 7)
}

const Details = ({ walk }: { walk?: Walk }) => (
  <div className="grid grid-cols-2 gap-3">
    <Field label="Минути" name="minutes" inputMode="numeric" defaultValue={walk?.minutes ?? ''} placeholder="по желание" />
    <Field label="Километри" name="km" inputMode="decimal" defaultValue={walk?.distance_km ?? ''} placeholder="по желание" />
  </div>
)

export function Calendar({ month, today, walks, frozen }: { month: string; today: string; walks: Walk[]; frozen: string[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const sheet = useRef<HTMLDialogElement>(null)

  const first = month + '-01'
  const length = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5), 0)).getUTCDate()
  const cells = Array.from({ length }, (_, i) => addDays(first, i))
  const onDay = (day: string) => walks.filter((w) => w.walked_on === day)
  const picked = selected ? onDay(selected) : []

  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between">
        <Link href={`/today?m=${shift(month, -1)}`} scroll={false} aria-label="Предишен месец" className="btn-ghost min-h-11 px-4">‹</Link>
        <h2 className="text-lg font-bold capitalize">{monthTitle(month)}</h2>
        {month < today.slice(0, 7) ? (
          <Link href={`/today?m=${shift(month, 1)}`} scroll={false} aria-label="Следващ месец" className="btn-ghost min-h-11 px-4">›</Link>
        ) : (
          <span className="w-11" />
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => <div key={d} className="py-1 text-xs font-semibold text-muted">{d}</div>)}
        {Array.from({ length: weekday(first) }, (_, i) => <div key={i} />)}
        {cells.map((day) => {
          const n = onDay(day).length
          const isFrozen = frozen.includes(day)
          const state = n ? plural(n, 'разходка', 'разходки') : isFrozen ? 'почивен ден' : 'без разходка'
          return (
            <button
              key={day}
              disabled={day > today}
              aria-label={`${dayTitle(day)}: ${state}`}
              onClick={() => { setSelected(day); sheet.current?.showModal() }}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold disabled:opacity-35
                ${n ? 'bg-primary text-primary-ink' : isFrozen ? 'border border-ice text-ice' : ''}
                ${day === today ? 'ring-2 ring-flame ring-offset-2 ring-offset-card' : ''}`}
            >
              {+day.slice(8)}
              <span className="h-3 text-[10px] leading-3" aria-hidden>{n > 1 ? `×${n}` : n ? '✓' : isFrozen ? '❄' : ''}</span>
            </button>
          )
        })}
      </div>

      <dialog ref={sheet} className="sheet" onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold capitalize">{dayTitle(selected)}</h3>
              <button className="btn-ghost min-h-11 px-4" onClick={() => sheet.current?.close()}>Затвори</button>
            </div>

            {picked.map((walk, i) => (
              <div key={walk.id} className="rounded-2xl border border-line p-3">
                <p className="mb-2 text-sm font-semibold text-muted">Разходка {i + 1}</p>
                <Form action={saveWalk} submit="Запази" className="btn-ghost">
                  <input type="hidden" name="id" value={walk.id} />
                  <Details walk={walk} />
                </Form>
                <div className="mt-2">
                  <Form action={deleteWalk} submit="Изтрий разходката" className="min-h-11 text-sm font-semibold text-danger">
                    <input type="hidden" name="id" value={walk.id} />
                  </Form>
                </div>
              </div>
            ))}

            <div>
              <p className="mb-2 text-sm font-semibold text-muted">{picked.length ? 'Още една разходка' : 'Запиши разходка за този ден'}</p>
              <Form action={logWalk} submit="Добави разходка">
                <input type="hidden" name="day" value={selected} />
                <Details />
              </Form>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
