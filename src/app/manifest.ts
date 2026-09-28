import type { MetadataRoute } from 'next'

/** Makes the check-in installable (iPhone only allows web push from the Home Screen). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Daily Check-In — Action for Happiness',
    short_name: 'Check-In',
    description: 'A gentle daily pause to breathe, reflect, and set one small intention.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFDF8',
    theme_color: '#E1446F',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
