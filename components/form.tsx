'use client'

import { useActionState } from 'react'

export type FormState = { error?: string; ok?: string; at?: number; earned?: string[] } | null
export type FormAction = (prev: FormState, data: FormData) => Promise<FormState>

export function Form({ action, submit, children, className = 'btn', confirm }: {
  action: FormAction
  submit: string
  children?: React.ReactNode
  className?: string
  confirm?: string
}) {
  const [state, formAction, pending] = useActionState(action, null)
  return (
    <form
      action={(data) => {
        data.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
        formAction(data)
      }}
      onSubmit={(event) => { if (confirm && !window.confirm(confirm)) event.preventDefault() }}
      className="flex flex-col gap-4"
    >
      {children}
      {state?.error && <p role="alert" className="text-sm font-medium text-danger">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm font-medium text-primary">{state.ok}</p>}
      <button className={className} disabled={pending}>{pending ? 'Момент…' : submit}</button>
    </form>
  )
}

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input" {...props} />
    </label>
  )
}
