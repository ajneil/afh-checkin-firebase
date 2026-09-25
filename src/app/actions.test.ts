import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeFirestore } from '@/test/fakeFirestore'

let fake: ReturnType<typeof fakeFirestore>
vi.mock('@/lib/db/firestore', () => ({ usersCollection: () => fake.db.collection('users') }))

let current: { email: string; name: string; timeZone: string; morningEmails: boolean } | null
vi.mock('@/lib/auth/currentUser', () => ({ getCurrentUser: async () => current }))

const getOrCreateCheckIn = vi.fn(async () => ({ token: 'tok-1' }))
vi.mock('@/lib/checkins/daily', () => ({ getOrCreateCheckIn }))

const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT ${url}`)
})
vi.mock('next/navigation', () => ({ redirect }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const { startTodaysCheckIn, setMorningEmails } = await import('./actions')

describe('server actions', () => {
  beforeEach(async () => {
    fake = fakeFirestore()
    vi.clearAllMocks()
    current = { email: 'alex@example.com', name: 'Alex', timeZone: 'Asia/Tokyo', morningEmails: true }
    await fake.db.doc('users/alex@example.com').create({ email: 'alex@example.com', morningEmails: true })
  })

  it('opens today’s check-in for the local date', async () => {
    vi.setSystemTime(new Date('2026-09-25T22:00:00Z'))
    await expect(startTodaysCheckIn()).rejects.toThrow('REDIRECT /checkin/tok-1')
    expect(getOrCreateCheckIn).toHaveBeenCalledWith(current, '2026-09-26')
    vi.useRealTimers()
  })

  it('sends signed-out visitors home instead', async () => {
    current = null
    await expect(startTodaysCheckIn()).rejects.toThrow('REDIRECT /')
    expect(getOrCreateCheckIn).not.toHaveBeenCalled()
  })

  it('turns morning emails off and on', async () => {
    const form = (value: string) => {
      const f = new FormData()
      f.set('enabled', value)
      return f
    }
    await setMorningEmails(form('off'))
    expect(fake.store.get('users/alex@example.com')).toMatchObject({ morningEmails: false })
    await setMorningEmails(form('on'))
    expect(fake.store.get('users/alex@example.com')).toMatchObject({ morningEmails: true })
  })

  it('ignores email changes from signed-out visitors', async () => {
    current = null
    await expect(setMorningEmails(new FormData())).rejects.toThrow('REDIRECT /')
  })
})
