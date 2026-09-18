import { NextRequest } from 'next/server'
import { checkInsCollection } from '@/lib/db/firestore'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    const snapshot = await checkInsCollection().doc(token).get()

    if (!snapshot.exists) {
      return Response.json({ status: 'not_found' }, { status: 404 })
    }

    if (snapshot.get('completedAt')) {
      return Response.json({ status: 'completed' })
    }

    return Response.json({ status: 'pending' })
  } catch {
    return Response.json({ status: 'not_found' }, { status: 404 })
  }
}
