import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeFirestore } from '@/test/fakeFirestore'

let fake: ReturnType<typeof fakeFirestore>
vi.mock('@/lib/db/firestore', () => ({
  get db() {
    return fake.db
  },
  usersCollection: () => fake.db.collection('users'),
  daysCollection: (email: string) => fake.db.collection(`users/${email}/days`),
  checkInsCollection: () => fake.db.collection('checkins'),
}))
vi.mock('@/lib/ai/morningPrompt', () => ({ morningPrompt: async () => 'A kind question?' }))
const sendEmail = vi.fn(async () => {})
vi.mock('@/lib/email/mailer', () => ({ sendEmail }))

const { sendMorningEmails, MORNING_HOUR } = await import('./sendMorningEmails')

// 06:30 UTC on 25 September = 07:30 in London (BST).
const londonMorning = new Date('2026-09-25T06:30:00Z')
const user = (email: string, over: Record<string, unknown> = {}) =>
  fake.db.doc(`users/${email}`).create({
    name: 'Alex',
    email,
    timeZone: 'Europe/London',
    morningEmails: true,
    ...over,
  })

describe('sendMorningEmails', () => {
  beforeEach(() => {
    fake = fakeFirestore()
    sendEmail.mockClear()
    process.env.APP_URL = 'https://checkin.example'
  })

  it('sends at 7am local time', () => expect(MORNING_HOUR).toBe(7))

  it('emails today’s check-in link and AI prompt at the local morning hour', async () => {
    await user('alex@example.com')
    expect(await sendMorningEmails(londonMorning)).toEqual({ sent: 1, skipped: 0, failed: 0 })
    const [to, subject, html] = sendEmail.mock.calls[0] as unknown as [string, string, string]
    expect(to).toBe('alex@example.com')
    expect(subject).toMatch(/check-in/i)
    expect(html).toContain('A kind question?')
    expect(html).toMatch(/https:\/\/checkin\.example\/checkin\/[\w-]+/)
  })

  it('ignores people whose local time is not the morning hour', async () => {
    await user('tokyo@example.com', { timeZone: 'Asia/Tokyo' })
    expect((await sendMorningEmails(londonMorning)).sent).toBe(0)
  })

  it('respects people who turned morning emails off', async () => {
    await user('quiet@example.com', { morningEmails: false })
    expect((await sendMorningEmails(londonMorning)).sent).toBe(0)
  })

  it('sends at most once per day, even if the job runs twice', async () => {
    await user('alex@example.com')
    await sendMorningEmails(londonMorning)
    expect(await sendMorningEmails(londonMorning)).toEqual({ sent: 0, skipped: 1, failed: 0 })
    expect(sendEmail).toHaveBeenCalledOnce()
  })

  it('skips people who already checked in today', async () => {
    await user('early@example.com')
    const { getOrCreateCheckIn } = await import('@/lib/checkins/daily')
    const today = await getOrCreateCheckIn({ email: 'early@example.com', name: 'A' }, '2026-09-25')
    await fake.db.doc(`checkins/${today.token}`).update({ completedAt: new Date() })
    expect((await sendMorningEmails(londonMorning)).skipped).toBe(1)
  })

  it('keeps going when one email fails, and retries it on the next hourly run', async () => {
    await user('a@example.com')
    await user('b@example.com')
    sendEmail.mockRejectedValueOnce(new Error('SMTP down'))
    expect(await sendMorningEmails(londonMorning)).toEqual({ sent: 1, skipped: 0, failed: 1 })
    const nextRun = new Date('2026-09-25T07:30:00Z')
    expect(await sendMorningEmails(nextRun)).toEqual({ sent: 1, skipped: 1, failed: 0 })
  })

  it('stops catching up by late morning', async () => {
    await user('alex@example.com')
    expect((await sendMorningEmails(new Date('2026-09-25T09:30:00Z'))).sent).toBe(0)
  })
})
