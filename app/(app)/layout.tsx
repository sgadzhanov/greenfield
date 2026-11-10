import { Nav } from '@/components/nav'

// Static shell only. Identity is checked in proxy.ts and again by fetchState() in every page.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex flex-col gap-4 pb-24 pt-6">{children}</main>
      <Nav />
    </>
  )
}
