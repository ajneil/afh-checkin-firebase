import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  // Application Default Credentials — provided automatically on Firebase App
  // Hosting / Cloud Run, and by FIRESTORE_EMULATOR_HOST for local dev.
  initializeApp()
}

export const db = getFirestore()

export type UserDoc = {
  name: string
  email: string
  createdAt: Date
}

export type CheckInDoc = {
  userId: string
  date: Date
  completedAt: Date | null
  breatheNote: string | null
  reflection: string | null
  gratitude: string | null
  intention: string | null
  createdAt: Date
}

export const usersCollection = () => db.collection('users')
export const checkInsCollection = () => db.collection('checkins')
