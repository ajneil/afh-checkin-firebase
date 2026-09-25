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

const morningPrompt = vi.fn(async () => 'What would make today kind?')
vi.mock('@/lib/ai/morningPrompt', () => ({ morningPrompt }))

const { getOrCreateCheckIn, recentCheckIns } = await import('./daily')
const alex = { email: 'alex@example.com', name: 'Alex' }

describe('getOrCreateCheckIn', () => {
  beforeEach(() => {
    fake = fakeFirestore()
    morningPrompt.mockClear()
  })

  it('creates the day and its check-in together, with a prompt', async () => {
    const today = await getOrCreateCheckIn(alex, '2026-09-25')
    expect(today).toMatchObject({ prompt: 'What would make today kind?', emailedAt: null })
    expect(fake.store.get(`checkins/${today.token}`)).toMatchObject({
      userId: 'alex@example.com',
      day: '2026-09-25',
      prompt: 'What would make today kind?',
      completedAt: null,
    })
  })

  it('returns the existing check-in for the same day without asking the AI again', async () => {
    const first = await getOrCreateCheckIn(alex, '2026-09-25')
    const second = await getOrCreateCheckIn(alex, '2026-09-25')
    expect(second.token).toBe(first.token)
    expect(morningPrompt).toHaveBeenCalledOnce()
  })

  it('keeps one check-in per day when two requests race', async () => {
    const [a, b] = await Promise.all([
      getOrCreateCheckIn(alex, '2026-09-25'),
      getOrCreateCheckIn(alex, '2026-09-25'),
    ])
    expect(a.token).toBe(b.token)
    expect([...fake.store.keys()].filter((k) => k.startsWith('checkins/'))).toHaveLength(1)
  })

  it('personalises the prompt from recent completed check-ins', async () => {
    const earlier = await getOrCreateCheckIn(alex, '2026-09-24')
    await fake.db.doc(`checkins/${earlier.token}`).update({
      completedAt: new Date(),
      reflection: 'Calm',
      gratitude: 'Tea',
      intention: 'Call Mum',
    })
    await getOrCreateCheckIn(alex, '2026-09-25')
    expect(morningPrompt).toHaveBeenLastCalledWith(
      'Alex',
      [{ day: '2026-09-24', reflection: 'Calm', gratitude: 'Tea', intention: 'Call Mum' }],
      '2026-09-25'
    )
  })
})

describe('recentCheckIns', () => {
  beforeEach(() => {
    fake = fakeFirestore()
  })

  it('lists completed check-ins newest first, skipping unfinished days', async () => {
    for (const day of ['2026-09-22', '2026-09-23', '2026-09-24']) {
      const { token } = await getOrCreateCheckIn(alex, day)
      if (day !== '2026-09-23')
        await fake.db.doc(`checkins/${token}`).update({ completedAt: new Date(), intention: day })
    }
    const recent = await recentCheckIns(alex.email, 5)
    expect(recent.map((r) => r.day)).toEqual(['2026-09-24', '2026-09-22'])
  })
})
