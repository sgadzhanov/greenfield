import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Разходки',
    short_name: 'Разходки',
    lang: 'bg',
    start_url: '/today',
    display: 'standalone',
    background_color: '#f7f3ec',
    theme_color: '#2c7a4b',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
