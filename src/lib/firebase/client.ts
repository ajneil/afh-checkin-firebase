'use client'

import { getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, inMemoryPersistence, setPersistence, type Auth } from 'firebase/auth'

let auth: Auth | undefined

/**
 * Browser Firebase Auth, used only to prove who someone is. The server swaps the
 * resulting ID token for its own session cookie, so no auth state is kept here.
 */
export function clientAuth(): Auth {
  if (auth) return auth
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
  auth = getAuth(app)
  const emulator = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL
  if (emulator) connectAuthEmulator(auth, emulator, { disableWarnings: true })
  void setPersistence(auth, inMemoryPersistence)
  return auth
}
