import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { checkInsCollection, usersCollection } from '@/lib/db/firestore'
import { isValidEmail } from '@/lib/validation/email'

export const dynamic = 'force-dynamic'
import { sendEmail } from '@/lib/email/mailer'
import { welcomeEmail } from '@/lib/email/templates/welcome'
import { checkInEmail } from '@/lib/email/templates/checkin'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email } = body as Record<string, unknown>

  if (!name || typeof name !== 'string' || !email || typeof email !== 'string') {
    return Response.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (!isValidEmail(normalizedEmail)) {
    return Response.json({ error: 'Please enter a valid email address' }, { status: 400 })
  }

  try {
    // The email is the User doc ID, so `.create()` fails atomically if it already
    // exists — no separate lookup-then-write race between two concurrent signups.
    const userRef = usersCollection().doc(normalizedEmail)
    try {
      await userRef.create({ name, email: normalizedEmail, createdAt: new Date() })
    } catch {
      return Response.json({ error: 'This email is already registered' }, { status: 400 })
    }

    const token = randomUUID()
    await checkInsCollection().doc(token).create({
      userId: normalizedEmail,
      date: new Date(),
      completedAt: null,
      breatheNote: null,
      reflection: null,
      gratitude: null,
      intention: null,
      createdAt: new Date(),
    })

    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
    const checkInUrl = `${appUrl}/checkin/${token}`

    // The account and check-in record are already saved at this point. A failure to
    // send email is a delivery problem, not a signup failure — surface it distinctly
    // rather than returning a 500 that implies nothing was created.
    try {
      await sendEmail(normalizedEmail, 'Welcome to your Daily Check-In', welcomeEmail(name))
      await sendEmail(normalizedEmail, 'Your Daily Check-In is ready 🌱', checkInEmail(name, checkInUrl))
    } catch (err) {
      console.error('Signup succeeded but email delivery failed', err)
      return Response.json(
        { success: true, emailDelivered: false },
        { status: 200 }
      )
    }

    return Response.json({ success: true, emailDelivered: true })
  } catch {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
