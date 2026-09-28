import { createHash } from 'node:crypto'
import { devicesCollection } from '@/lib/db/firestore'

/** Stable, path-safe document ID for an FCM token. */
export const deviceId = (token: string) => createHash('sha256').update(token).digest('hex')

export async function saveDevice(email: string, token: string): Promise<void> {
  await devicesCollection(email).doc(deviceId(token)).set({ token, updatedAt: new Date() })
}

export async function removeDevice(email: string, token: string): Promise<void> {
  await devicesCollection(email).doc(deviceId(token)).delete()
}

export async function listDevices(email: string): Promise<string[]> {
  const snap = await devicesCollection(email).get()
  return snap.docs.map((d) => d.get('token')).filter((t): t is string => typeof t === 'string')
}
