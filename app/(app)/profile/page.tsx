import Link from 'next/link'
import { Field, Form } from '@/components/form'
import { fetchState } from '@/lib/data'
import { logout, updateName } from '../actions'

export default async function Profile() {
  const { profile } = await fetchState()
  return (
    <>
      <h1 className="text-2xl font-extrabold">Профил</h1>
      <section className="card">
        <Form action={updateName} submit="Запази името" className="btn-ghost">
          <Field label="Име" name="name" defaultValue={profile.display_name} maxLength={50} required />
        </Form>
      </section>
      <Link href="/update-password" className="btn-ghost">Смени паролата</Link>
      <form action={logout}>
        <button className="btn-ghost w-full text-danger">Изход</button>
      </form>
    </>
  )
}
