import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const font = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-app' })

export const metadata: Metadata = {
  title: 'Разходки',
  description: 'Отбелязвай разходките си и пази серията жива.',
}
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f3ec' },
    { media: '(prefers-color-scheme: dark)', color: '#111613' },
  ],
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" className={font.variable}>
      <body className="font-sans antialiased">
        <div className="mx-auto min-h-dvh w-full max-w-lg px-4">{children}</div>
      </body>
    </html>
  )
}
