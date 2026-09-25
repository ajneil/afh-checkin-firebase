import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, usersCollection } from '@/lib/db/firestore'
import { sendEmail } from '@/lib/email/mailer'
import { welcomeEmail } from '@/lib/email/templates/welcome'
import { SESSION_COOKIE, SESSION_DAYS } from '@/lib/auth/constants'
import { DEFAULT_TIME_ZONE, isValidTimeZone } from '@/lib/time/localTime'

export const dynamic = 'force-dynamic'

const MAX_SIGN_IN_AGE_SECONDS = 5 * 60

/** Exchange a fresh Firebase ID token (Google or email link) for a session cookie. */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { idToken, name, timeZone } = body
  if (typeof idToken !== 'string' || !idToken) {
    return Response.json({ error: 'Sign-in token is required' }, { status: 400 })
  }

  let claims: Awaited<ReturnType<ReturnType<typeof adminAuth>['verifyIdToken']>>
  try {
    claims = await adminAuth().verifyIdToken(idToken, true)
  } catch {
    return Response.json({ error: 'Sign-in could not be verified' }, { status: 401 })
  }
  const recent = Date.now() / 1000 - claims.auth_time < MAX_SIGN_IN_AGE_SECONDS
  if (!claims.email || !claims.email_verified || !recent) {
    return Response.json({ error: 'Please sign in again' }, { status: 401 })
  }

  const email = claims.email.trim().toLowerCase()
  const zone = typeof timeZone === 'string' && isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE
  const typedName = typeof name === 'string' ? name.trim().slice(0, 80) : ''
  const displayName = typedName || (typeof claims.name === 'string' ? claims.name : '') || email.split('@')[0]

  try {
    const userRef = usersCollection().doc(email)
    let isNew = true
    try {
      await userRef.create({
        name: displayName,
        email,
        uid: claims.uid,
        timeZone: zone,
        morningEmails: true,
        createdAt: new Date(),
      })
    } catch {
      // Existing account, including ones from the original name-and-email sign-up.
      isNew = false
      const existing = await userRef.get()
      await userRef.update({
        uid: claims.uid,
        timeZone: zone,
        // Accounts from before sign-in existed have no preference yet: default to on.
        ...(existing.get('morningEmails') === undefined ? { morningEmails: true } : {}),
      })
    }

    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_DAYS * 24 * 60 * 60 * 1000,
    })
    ;(await cookies()).set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    })

    if (isNew) {
      try {
        await sendEmail(email, 'Welcome to your Daily Check-In', welcomeEmail(displayName))
      } catch (err) {
        console.error('Account created but welcome email failed', err)
      }
    }
    return Response.json({ success: true, isNew })
  } catch {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

export async function DELETE() {
  ;(await cookies()).delete(SESSION_COOKIE)
  return Response.json({ success: true })
}
