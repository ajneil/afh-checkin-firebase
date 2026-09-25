import { daysCollection, usersCollection } from '@/lib/db/firestore'
import { getOrCreateCheckIn } from '@/lib/checkins/daily'
import { sendEmail } from '@/lib/email/mailer'
import { checkInEmail } from '@/lib/email/templates/checkin'
import { DEFAULT_TIME_ZONE, localTime } from '@/lib/time/localTime'

/** Run hourly at :30, so each person is emailed at 7:30 in their own time zone. */
export const MORNING_HOUR = 7
/** Later runs that morning retry anyone a failed or missed run did not reach. */
const CATCH_UP_HOURS = 3

export async function sendMorningEmails(now: Date) {
  const result = { sent: 0, skipped: 0, failed: 0 }
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const users = await usersCollection().where('morningEmails', '==', true).get()

  for (const doc of users.docs) {
    const email = String(doc.get('email') ?? doc.id)
    const name = String(doc.get('name') ?? '')
    const { day, hour } = localTime(now, String(doc.get('timeZone') ?? DEFAULT_TIME_ZONE))
    if (hour < MORNING_HOUR || hour >= MORNING_HOUR + CATCH_UP_HOURS) continue
    try {
      const today = await getOrCreateCheckIn({ email, name }, day)
      if (today.emailedAt || today.completed) {
        result.skipped++
        continue
      }
      await sendEmail(
        email,
        'Your Daily Check-In is ready 🌱',
        checkInEmail(name, `${appUrl}/checkin/${today.token}`, {
          prompt: today.prompt,
          manageUrl: `${appUrl}/`,
        })
      )
      // Marked after sending: a failed send is retried by the next run this morning.
      await daysCollection(email).doc(day).update({ emailedAt: now })
      result.sent++
    } catch (error) {
      result.failed++
      console.error('Morning email failed', { email, error: String(error) })
    }
  }
  return result
}
