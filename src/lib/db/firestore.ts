import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

if (!getApps().length) {
  // Application Default Credentials — provided automatically on Firebase App
  // Hosting / Cloud Run, and by FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST
  // for local dev.
  initializeApp()
}

export const db = getFirestore()
export const adminAuth = () => getAuth()
export const adminMessaging = () => getMessaging()

export type UserDoc = {
  name: string
  email: string
  uid: string | null
  timeZone: string
  morningEmails: boolean
  createdAt: Date
}

/** One per person per local calendar day: makes "today's check-in" a single lookup. */
export type DayDoc = {
  day: string
  token: string
  prompt: string
  emailedAt: Date | null
  pushedAt: Date | null
  createdAt: Date
}

export type CheckInDoc = {
  userId: string
  day: string | null
  prompt: string | null
  date: Date
  completedAt: Date | null
  breatheNote: string | null
  reflection: string | null
  gratitude: string | null
  intention: string | null
  createdAt: Date
}

export const usersCollection = () => db.collection('users')
export const daysCollection = (email: string) => usersCollection().doc(email).collection('days')
export const checkInsCollection = () => db.collection('checkins')
/** Push-notification devices; doc ID = sha256 of the FCM token. */
export const devicesCollection = (email: string) => usersCollection().doc(email).collection('devices')
