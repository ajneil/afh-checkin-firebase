import { randomUUID } from 'node:crypto'
import { checkInsCollection, daysCollection, db } from '@/lib/db/firestore'
import { morningPrompt, type RecentAnswer } from '@/lib/ai/morningPrompt'

export type Today = { token: string; prompt: string; emailedAt: Date | null; completed: boolean }

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)

/** Completed check-ins, newest first. Reads the per-day index, so no composite index is needed. */
export async function recentCheckIns(email: string, limit: number): Promise<RecentAnswer[]> {
  const days = await daysCollection(email).orderBy('day', 'desc').limit(limit * 2).get()
  if (days.empty) return []
  const refs = days.docs.map((d) => checkInsCollection().doc(String(d.get('token'))))
  const checkIns = await db.getAll(...refs)
  return checkIns
    .filter((c) => c.exists && c.get('completedAt'))
    .slice(0, limit)
    .map((c) => ({
      day: String(c.get('day')),
      reflection: text(c.get('reflection')),
      gratitude: text(c.get('gratitude')),
      intention: text(c.get('intention')),
    }))
}

export async function findCheckIn(email: string, day: string): Promise<Today | null> {
  const snap = await daysCollection(email).doc(day).get()
  if (!snap.exists) return null
  const token = String(snap.get('token'))
  const checkIn = await checkInsCollection().doc(token).get()
  const emailedAt = snap.get('emailedAt')
  return {
    token,
    prompt: String(snap.get('prompt') ?? ''),
    emailedAt: emailedAt ? new Date(emailedAt.toDate?.() ?? emailedAt) : null,
    completed: Boolean(checkIn.get('completedAt')),
  }
}

/** Today's check-in for a person, created (with an AI-written prompt) on first request. */
export async function getOrCreateCheckIn(
  user: { email: string; name: string },
  day: string
): Promise<Today> {
  const existing = await findCheckIn(user.email, day)
  if (existing) return existing

  const prompt = await morningPrompt(user.name, await recentCheckIns(user.email, 3), day)
  const token = randomUUID()
  const now = new Date()
  try {
    // Both documents or neither: the day doc's create() fails if another request won.
    await db
      .batch()
      .create(daysCollection(user.email).doc(day), { day, token, prompt, emailedAt: null, createdAt: now })
      .create(checkInsCollection().doc(token), {
        userId: user.email,
        day,
        prompt,
        date: now,
        completedAt: null,
        breatheNote: null,
        reflection: null,
        gratitude: null,
        intention: null,
        createdAt: now,
      })
      .commit()
  } catch (error) {
    const winner = await findCheckIn(user.email, day)
    if (winner) return winner
    throw error
  }
  return { token, prompt, emailedAt: null, completed: false }
}
