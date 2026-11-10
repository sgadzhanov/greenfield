'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/today', icon: '🔥', label: 'Днес' },
  { href: '/badges', icon: '🏅', label: 'Постижения' },
  { href: '/profile', icon: '👤', label: 'Профил' },
]

export function Nav() {
  const path = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-lg">
        {TABS.map((tab) => (
          <li key={tab.href} className="flex-1">
            <Link
              href={tab.href}
              aria-current={path === tab.href ? 'page' : undefined}
              className="flex min-h-14 flex-col items-center justify-center text-xs font-semibold text-muted aria-[current]:text-primary"
            >
              <span className="text-xl" aria-hidden>{tab.icon}</span>
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
