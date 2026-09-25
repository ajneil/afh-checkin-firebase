import { cookies } from 'next/headers'
import { adminAuth, usersCollection } from '@/lib/db/firestore'
import { SESSION_COOKIE } from './constants'
import { DEFAULT_TIME_ZONE } from '@/lib/time/localTime'

export type CurrentUser = {
  name: string
  email: string
  timeZone: string
  morningEmails: boolean
}

/** The signed-in person from the session cookie, or null. Server-only. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value
  if (!cookie) return null
  try {
    const claims = await adminAuth().verifySessionCookie(cookie, true)
    if (!claims.email) return null
    const snap = await usersCollection().doc(claims.email.toLowerCase()).get()
    if (!snap.exists) return null
    return {
      name: String(snap.get('name') ?? ''),
      email: String(snap.get('email')),
      timeZone: String(snap.get('timeZone') ?? DEFAULT_TIME_ZONE),
      morningEmails: snap.get('morningEmails') !== false,
    }
  } catch {
    return null
  }
}
