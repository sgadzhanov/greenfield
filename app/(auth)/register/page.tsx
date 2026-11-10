import Link from 'next/link'
import { Field, Form } from '@/components/form'
import { register } from '../actions'

export default function Register() {
  return (
    <>
      <h1 className="text-3xl font-extrabold">Нов профил</h1>
      <Form action={register} submit="Създай профил">
        <Field label="Име" name="name" autoComplete="given-name" maxLength={50} required />
        <Field label="Имейл" name="email" type="email" autoComplete="email" required />
        <Field label="Парола (поне 8 знака)" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Form>
      <p className="text-sm text-muted">
        Вече имаш профил? <Link href="/login" className="font-medium text-primary">Влез</Link>
      </p>
    </>
  )
}
