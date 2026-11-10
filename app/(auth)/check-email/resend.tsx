'use client'

import { useActionState, useEffect, useState } from 'react'
import { resend } from '../actions'

const WAIT_MS = 60_000 // matches Supabase's per-email send limit

export function Resend() {
  const [state, action, pending] = useActionState(resend, null)
  const [now, setNow] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const left = state?.at && now ? Math.ceil((state.at + WAIT_MS - now) / 1000) : 0

  return (
    <form action={action} className="flex flex-col gap-3">
      {state?.error && <p role="alert" className="text-sm font-medium text-danger">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm font-medium text-primary">{state.ok}</p>}
      <button className="btn-ghost" disabled={pending || left > 0}>
        {left > 0 ? `Изпрати отново след ${left} сек.` : 'Изпрати имейла отново'}
      </button>
    </form>
  )
}
