import { NextRequest } from 'next/server'
import { checkInsCollection } from '@/lib/db/firestore'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { token, reflection, gratitude, intention } = body as Record<string, unknown>

  if (!token || typeof token !== 'string') {
    return Response.json({ error: 'Token is required' }, { status: 400 })
  }

  try {
    const checkInRef = checkInsCollection().doc(token)
    const snapshot = await checkInRef.get()

    if (!snapshot.exists) {
      return Response.json({ error: 'Check-in not found' }, { status: 404 })
    }

    if (snapshot.get('completedAt')) {
      return Response.json({ error: 'This check-in has already been completed' }, { status: 400 })
    }

    await checkInRef.update({
      reflection: typeof reflection === 'string' ? reflection : null,
      gratitude: typeof gratitude === 'string' ? gratitude : null,
      intention: typeof intention === 'string' ? intention : null,
      completedAt: new Date(),
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
