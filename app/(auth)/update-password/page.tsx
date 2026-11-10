import { Field, Form } from '@/components/form'
import { updatePassword } from '../actions'

export default function UpdatePassword() {
  return (
    <>
      <h1 className="text-3xl font-extrabold">Нова парола</h1>
      <p className="text-muted">След смяната ще те помолим да влезеш отново с новата парола.</p>
      <Form action={updatePassword} submit="Запази паролата">
        <Field label="Нова парола (поне 8 знака)" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Form>
    </>
  )
}
