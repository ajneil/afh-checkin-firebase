import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth/currentUser'
import { removeDevice, saveDevice } from '@/lib/push/devices'

export const dynamic = 'force-dynamic'

async function readToken(request: NextRequest): Promise<string | null> {
  try {
    const { token } = await request.json()
    return typeof token === 'string' && token.length >= 20 && token.length <= 4096 ? token : null
  } catch {
    return null
  }
}

async function handle(request: NextRequest, action: (email: string, token: string) => Promise<void>) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Please sign in' }, { status: 401 })
  const token = await readToken(request)
  if (!token) return Response.json({ error: 'A device token is required' }, { status: 400 })
  try {
    await action(user.email, token)
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

/** Register this browser's FCM token for morning notifications. */
export const POST = (request: NextRequest) => handle(request, saveDevice)
/** Stop morning notifications on this browser. */
export const DELETE = (request: NextRequest) => handle(request, removeDevice)
