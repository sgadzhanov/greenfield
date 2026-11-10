import Link from 'next/link'
import { Suspense } from 'react'
import { Field, Form } from '@/components/form'
import { login } from '../actions'

async function Notice({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams
  return m === 'reset' ? <p role="status" className="card text-primary">Паролата е сменена. Влез с новата парола.</p> : null
}

export default function Login({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  return (
    <>
      <h1 className="text-3xl font-extrabold">Вход</h1>
      <Suspense><Notice searchParams={searchParams} /></Suspense>
      <Form action={login} submit="Влез">
        <Field label="Имейл" name="email" type="email" autoComplete="email" required />
        <Field label="Парола" name="password" type="password" autoComplete="current-password" required />
      </Form>
      <div className="flex justify-between text-sm font-medium text-primary">
        <Link href="/forgot-password">Забравена парола?</Link>
        <Link href="/register">Нов профил</Link>
      </div>
    </>
  )
}
