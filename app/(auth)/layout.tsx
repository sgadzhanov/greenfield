import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col justify-center gap-6 py-10">
      <Link href="/" className="text-2xl font-extrabold">🔥 Разходки</Link>
      {children}
    </main>
  )
}
