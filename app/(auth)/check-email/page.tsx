import Link from 'next/link'
import { Resend } from './resend'

export default function CheckEmail() {
  return (
    <>
      <p className="text-6xl">📬</p>
      <h1 className="text-3xl font-extrabold">Провери пощата си</h1>
      <p className="text-muted">
        Изпратихме ти имейл с линк за потвърждение. Отвори го на това устройство и влизаш направо в таблото.
        Линкът е валиден един час. Ако не го виждаш, погледни и в папка „Спам“.
      </p>
      <Resend />
      <Link href="/login" className="text-sm font-medium text-primary">Към вход</Link>
    </>
  )
}
