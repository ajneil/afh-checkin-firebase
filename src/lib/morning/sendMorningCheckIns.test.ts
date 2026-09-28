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
const sendPush = vi.fn(async (tokens: string[]) => ({ sent: tokens.length, gone: [] as string[], failed: 0 }))
vi.mock('@/lib/push/sendPush', () => ({ sendPush }))
vi.mock('@/lib/push/devices', async () => {
  const actual = await vi.importActual<typeof import('@/lib/push/devices')>('@/lib/push/devices')
  return {
    ...actual,
    listDevices: async (email: string) =>
      (await fake.db.collection(`users/${email}/devices`).get()).docs.map((d) => String(d.get('token'))),
    removeDevice: async (email: string, token: string) =>
      fake.db.doc(`users/${email}/devices/${actual.deviceId(token)}`).delete(),
  }
})

const { sendMorningCheckIns, MORNING_HOUR } = await import('./sendMorningCheckIns')
const { deviceId } = await import('@/lib/push/devices')

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

describe('sendMorningCheckIns: email', () => {
  beforeEach(() => {
    fake = fakeFirestore()
    sendEmail.mockClear()
    sendPush.mockClear()
    process.env.APP_URL = 'https://checkin.example'
  })

  it('sends at 7am local time', () => expect(MORNING_HOUR).toBe(7))

  it('emails today’s check-in link and AI prompt at the local morning hour', async () => {
    await user('alex@example.com')
    expect(await sendMorningCheckIns(londonMorning)).toEqual({ emailed: 1, pushed: 0, skipped: 0, failed: 0 })
    const [to, subject, html] = sendEmail.mock.calls[0] as unknown as [string, string, string]
    expect(to).toBe('alex@example.com')
    expect(subject).toMatch(/check-in/i)
    expect(html).toContain('A kind question?')
    expect(html).toMatch(/https:\/\/checkin\.example\/checkin\/[\w-]+/)
  })

  it('ignores people whose local time is not the morning hour', async () => {
    await user('tokyo@example.com', { timeZone: 'Asia/Tokyo' })
    expect((await sendMorningCheckIns(londonMorning)).emailed).toBe(0)
  })

  it('respects people who turned morning emails off', async () => {
    await user('quiet@example.com', { morningEmails: false })
    expect((await sendMorningCheckIns(londonMorning)).emailed).toBe(0)
  })

  it('sends at most once per day, even if the job runs twice', async () => {
    await user('alex@example.com')
    await sendMorningCheckIns(londonMorning)
    expect(await sendMorningCheckIns(londonMorning)).toEqual({ emailed: 0, pushed: 0, skipped: 1, failed: 0 })
    expect(sendEmail).toHaveBeenCalledOnce()
  })

  it('skips people who already checked in today', async () => {
    await user('early@example.com')
    const { getOrCreateCheckIn } = await import('@/lib/checkins/daily')
    const today = await getOrCreateCheckIn({ email: 'early@example.com', name: 'A' }, '2026-09-25')
    await fake.db.doc(`checkins/${today.token}`).update({ completedAt: new Date() })
    expect((await sendMorningCheckIns(londonMorning)).skipped).toBe(1)
  })

  it('keeps going when one email fails, and retries it on the next hourly run', async () => {
    await user('a@example.com')
    await user('b@example.com')
    sendEmail.mockRejectedValueOnce(new Error('SMTP down'))
    expect(await sendMorningCheckIns(londonMorning)).toEqual({ emailed: 1, pushed: 0, skipped: 0, failed: 1 })
    const nextRun = new Date('2026-09-25T07:30:00Z')
    expect(await sendMorningCheckIns(nextRun)).toEqual({ emailed: 1, pushed: 0, skipped: 1, failed: 0 })
  })

  it('stops catching up by late morning', async () => {
    await user('alex@example.com')
    expect((await sendMorningCheckIns(new Date('2026-09-25T09:30:00Z'))).emailed).toBe(0)
  })
})

describe('sendMorningCheckIns: push', () => {
  const device = (email: string, token: string) =>
    fake.db.doc(`users/${email}/devices/${deviceId(token)}`).create({ token })

  beforeEach(() => {
    fake = fakeFirestore()
    sendEmail.mockClear()
    sendPush.mockClear()
    process.env.APP_URL = 'https://checkin.example'
  })

  it('sends a morning notification that opens today’s check-in', async () => {
    await user('alex@example.com', { name: 'Alex Neil' })
    await device('alex@example.com', 'tok-1')
    expect(await sendMorningCheckIns(londonMorning)).toEqual({ emailed: 1, pushed: 1, skipped: 0, failed: 0 })
    const [tokens, message] = sendPush.mock.calls[0] as unknown as [string[], { title: string; body: string; url: string }]
    expect(tokens).toEqual(['tok-1'])
    expect(message.title).toBe('Good morning, Alex')
    expect(message.body).toBe('A kind question?')
    expect(message.url).toMatch(/^https:\/\/checkin\.example\/checkin\/[\w-]+$/)
  })

  it('still notifies people who turned emails off', async () => {
    await user('quiet@example.com', { morningEmails: false })
    await device('quiet@example.com', 'tok-q')
    expect(await sendMorningCheckIns(londonMorning)).toEqual({ emailed: 0, pushed: 1, skipped: 0, failed: 0 })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('notifies at most once a day', async () => {
    await user('alex@example.com')
    await device('alex@example.com', 'tok-1')
    await sendMorningCheckIns(londonMorning)
    await sendMorningCheckIns(new Date('2026-09-25T07:30:00Z'))
    expect(sendPush).toHaveBeenCalledOnce()
  })

  it('forgets devices the push service says are gone', async () => {
    await user('alex@example.com', { morningEmails: false })
    await device('alex@example.com', 'dead')
    sendPush.mockResolvedValueOnce({ sent: 0, gone: ['dead'], failed: 0 })
    await sendMorningCheckIns(londonMorning)
    expect([...fake.store.keys()].some((k) => k.includes('/devices/'))).toBe(false)
  })

  it('a failed email does not stop the notification', async () => {
    await user('alex@example.com')
    await device('alex@example.com', 'tok-1')
    sendEmail.mockRejectedValueOnce(new Error('SMTP down'))
    expect(await sendMorningCheckIns(londonMorning)).toEqual({ emailed: 0, pushed: 1, skipped: 0, failed: 1 })
  })
})

