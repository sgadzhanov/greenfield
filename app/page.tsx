import Link from 'next/link'

export default function Landing() {
  return (
    <main className="flex min-h-dvh flex-col justify-center gap-8 py-10">
      <div>
        <p className="text-6xl">🔥</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight">Една разходка на ден. Всеки ден.</h1>
        <p className="mt-4 text-lg text-muted">
          Отбелязвай разходките си с едно докосване, гледай как серията расте и събирай значки за постоянство.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Link href="/register" className="btn">Започни сега</Link>
        <Link href="/login" className="btn-ghost">Имам профил</Link>
      </div>
    </main>
  )
}
