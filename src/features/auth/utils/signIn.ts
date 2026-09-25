'use client'

import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { authErrorMessage } from './authErrorMessage'

const PENDING_KEY = 'afh:email-sign-in'

export type PendingSignIn = { email: string; name: string }

/** Turn a Firebase error into a readable one; returns quietly when there is nothing to say. */
function friendly(error: unknown): Error | null {
  const message = authErrorMessage(error)
  return message ? new Error(message) : null
}

async function startSession(user: User, name?: string) {
  const res = await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken: await user.getIdToken(),
      name,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  })
  await signOut(clientAuth())
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'Something went wrong signing you in. Please try again.')
  }
}

export async function signInWithGoogle(): Promise<void> {
  let user: User
  try {
    ;({ user } = await signInWithPopup(clientAuth(), new GoogleAuthProvider()))
  } catch (error) {
    const err = friendly(error)
    if (err) throw err
    return
  }
  await startSession(user)
  window.location.assign('/')
}

export async function sendEmailLink({ name, email }: PendingSignIn): Promise<void> {
  try {
    await sendSignInLinkToEmail(clientAuth(), email, {
      url: `${window.location.origin}/auth/finish`,
      handleCodeInApp: true,
    })
  } catch (error) {
    throw friendly(error) ?? error
  }
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ name, email }))
  } catch {
    // Private browsing: the finish page will ask for the email again.
  }
}

export function pendingSignIn(): PendingSignIn | null {
  try {
    const value = JSON.parse(localStorage.getItem(PENDING_KEY) ?? 'null')
    return value && typeof value.email === 'string' ? { email: value.email, name: String(value.name ?? '') } : null
  } catch {
    return null
  }
}

export const isEmailLink = () => isSignInWithEmailLink(clientAuth(), window.location.href)

export async function finishEmailLink({ name, email }: PendingSignIn): Promise<void> {
  let user: User
  try {
    ;({ user } = await signInWithEmailLink(clientAuth(), email, window.location.href))
  } catch (error) {
    throw friendly(error) ?? error
  }
  await startSession(user, name)
  try {
    localStorage.removeItem(PENDING_KEY)
  } catch {}
  window.location.replace('/')
}

export async function signOutEverywhere(): Promise<void> {
  await fetch('/api/session', { method: 'DELETE' })
  window.location.assign('/')
}
