import { daysCollection, usersCollection } from '@/lib/db/firestore'
import { getOrCreateCheckIn } from '@/lib/checkins/daily'
import { sendEmail } from '@/lib/email/mailer'
import { checkInEmail } from '@/lib/email/templates/checkin'
import { listDevices, removeDevice } from '@/lib/push/devices'
import { sendPush } from '@/lib/push/sendPush'
import { splitGreeting } from '@/lib/text/splitGreeting'
import { DEFAULT_TIME_ZONE, localTime } from '@/lib/time/localTime'

/** Run hourly at :30, so each person hears from us at 7:30 in their own time zone. */
export const MORNING_HOUR = 7
/** Later runs that morning retry anyone a failed or missed run did not reach. */
const CATCH_UP_HOURS = 3

/**
 * The morning email and push notification, sent independently and each at most
 * once a day (tracked by emailedAt / pushedAt on the day document).
 */
export async function sendMorningCheckIns(now: Date) {
  const result = { emailed: 0, pushed: 0, skipped: 0, failed: 0 }
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const users = await usersCollection().get()

  for (const doc of users.docs) {
    const email = String(doc.get('email') ?? doc.id)
    const name = String(doc.get('name') ?? '')
    const { day, hour } = localTime(now, String(doc.get('timeZone') ?? DEFAULT_TIME_ZONE))
    if (hour < MORNING_HOUR || hour >= MORNING_HOUR + CATCH_UP_HOURS) continue
    const wantsEmail = doc.get('morningEmails') === true
    let tokens: string[] = []
    try {
      tokens = await listDevices(email)
    } catch (error) {
      console.error('Could not list devices', { email, error: String(error) })
    }
    if (!wantsEmail && tokens.length === 0) continue

    let today
    try {
      today = await getOrCreateCheckIn({ email, name }, day)
    } catch (error) {
      result.failed++
      console.error('Could not prepare check-in', { email, error: String(error) })
      continue
    }
    if (today.completed) {
      result.skipped++
      continue
    }
    const link = `${appUrl}/checkin/${today.token}`
    let acted = false

    if (wantsEmail && !today.emailedAt) {
      acted = true
      try {
        await sendEmail(
          email,
          'Your Daily Check-In is ready 🌱',
          checkInEmail(name, link, { prompt: today.prompt, manageUrl: `${appUrl}/` })
        )
        // Marked after sending: a failed send is retried by the next run this morning.
        await daysCollection(email).doc(day).update({ emailedAt: now })
        result.emailed++
      } catch (error) {
        result.failed++
        console.error('Morning email failed', { email, error: String(error) })
      }
    }

    if (tokens.length > 0 && !today.pushedAt) {
      acted = true
      try {
        const first = name.split(' ')[0]
        const { greeting, body } = splitGreeting(today.prompt)
        const sent = await sendPush(tokens, {
          title: greeting?.replace(/[.!,]$/, '') ?? (first ? `Good morning, ${first}` : 'Good morning'),
          body: (greeting ? body : today.prompt).slice(0, 180),
          url: link,
        })
        await Promise.all(sent.gone.map((token) => removeDevice(email, token)))
        if (sent.sent > 0 || sent.failed === 0) await daysCollection(email).doc(day).update({ pushedAt: now })
        if (sent.sent > 0) result.pushed++
        if (sent.failed > 0) result.failed++
      } catch (error) {
        result.failed++
        console.error('Morning push failed', { email, error: String(error) })
      }
    }

    if (!acted) result.skipped++
  }
  return result
}
