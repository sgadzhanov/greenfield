import Link from 'next/link'
import { Field, Form } from '@/components/form'
import { resendTo } from '@/app/(auth)/actions'

export default function AuthError() {
  return (
    <main className="flex min-h-dvh flex-col justify-center gap-6 py-10">
      <p className="text-6xl">⏳</p>
      <h1 className="text-3xl font-extrabold">Линкът не е валиден</h1>
      <p className="text-muted">
        Този линк е изтекъл или вече е използван. Въведи имейла си и ще ти изпратим нов линк за потвърждение.
      </p>
      <Form action={resendTo} submit="Изпрати нов линк">
        <Field label="Имейл" name="email" type="email" autoComplete="email" required />
      </Form>
      <div className="flex justify-between text-sm font-medium text-primary">
        <Link href="/forgot-password">Трябва ми нова парола</Link>
        <Link href="/login">Към вход</Link>
      </div>
    </main>
  )
}
