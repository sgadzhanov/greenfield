import Link from 'next/link'
import { Field, Form } from '@/components/form'
import { forgotPassword } from '../actions'

export default function ForgotPassword() {
  return (
    <>
      <h1 className="text-3xl font-extrabold">Забравена парола</h1>
      <p className="text-muted">Въведи имейла си и ще ти изпратим линк за нова парола.</p>
      <Form action={forgotPassword} submit="Изпрати линк">
        <Field label="Имейл" name="email" type="email" autoComplete="email" required />
      </Form>
      <Link href="/login" className="text-sm font-medium text-primary">Към вход</Link>
    </>
  )
}
