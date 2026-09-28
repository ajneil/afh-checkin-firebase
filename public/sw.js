// Morning notifications: FCM data messages arrive here. Every push shows a
// notification (Safari requires it); tapping opens that day's check-in.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {}
  const data = payload.data || payload
  event.waitUntil(
    self.registration.showNotification(data.title || 'Your Daily Check-In is ready', {
      body: data.body || 'A few quiet minutes, just for you.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'morning-checkin',
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin)
  // Only ever open pages on this site.
  const target = url.origin === self.location.origin ? url.href : self.location.origin + '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin)
      if (open) return open.navigate(target).then((w) => (w || open).focus())
      return self.clients.openWindow(target)
    })
  )
})
