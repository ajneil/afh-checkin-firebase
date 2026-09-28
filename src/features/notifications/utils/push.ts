'use client'

import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import { clientApp } from '@/lib/firebase/client'

// Public Web Push certificate key (Firebase → Project settings → Cloud Messaging).
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim() ?? ''
export const pushConfigured = vapidKey.length > 0
const STORAGE_KEY = 'afh:push-token'

export const isPushSupported = () =>
  'serviceWorker' in navigator ? isSupported().catch(() => false) : Promise.resolve(false)

export function savedPushToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

async function send(method: 'POST' | 'DELETE', token: string) {
  const res = await fetch('/api/push', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  if (!res.ok) throw new Error('Push registration failed')
}

/** Register the service worker, get this browser's FCM token and store it server-side. */
export async function enablePush(): Promise<void> {
  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready
  const token = await getToken(getMessaging(clientApp()), { vapidKey, serviceWorkerRegistration: registration })
  const previous = savedPushToken()
  await send('POST', token)
  if (previous && previous !== token) await send('DELETE', previous).catch(() => {})
  try {
    localStorage.setItem(STORAGE_KEY, token)
  } catch {}
}

/** Tokens rotate; re-register the current one quietly on each visit. */
export const refreshPush = enablePush

/** Stop notifications on this browser (also used on sign-out). */
export async function disablePush(): Promise<void> {
  const token = savedPushToken()
  if (token) await send('DELETE', token)
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
