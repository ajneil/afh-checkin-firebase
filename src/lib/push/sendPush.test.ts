import { beforeEach, describe, expect, it, vi } from 'vitest'

const sendEachForMulticast = vi.fn()
vi.mock('@/lib/db/firestore', () => ({ adminMessaging: () => ({ sendEachForMulticast }) }))
const { sendPush } = await import('./sendPush')

const ok = { success: true }
const gone = { success: false, error: { code: 'messaging/registration-token-not-registered' } }
const flaky = { success: false, error: { code: 'messaging/internal-error' } }

describe('sendPush', () => {
  beforeEach(() => sendEachForMulticast.mockReset())

  it('sends a data-only web push that opens the given link', async () => {
    sendEachForMulticast.mockResolvedValue({ responses: [ok] })
    await sendPush(['t1'], { title: 'Good morning, Alex', body: 'Ready?', url: '/checkin/abc' })
    expect(sendEachForMulticast).toHaveBeenCalledWith({
      tokens: ['t1'],
      webpush: {
        headers: { TTL: '10800', Urgency: 'normal' },
        data: { title: 'Good morning, Alex', body: 'Ready?', url: '/checkin/abc' },
      },
    })
  })

  it('reports how many arrived and which tokens are gone for good', async () => {
    sendEachForMulticast.mockResolvedValue({ responses: [ok, gone, flaky] })
    expect(await sendPush(['a', 'b', 'c'], { title: 't', body: 'b', url: '/' })).toEqual({
      sent: 1,
      gone: ['b'],
      failed: 1,
    })
  })

  it('does nothing without tokens', async () => {
    expect(await sendPush([], { title: 't', body: 'b', url: '/' })).toEqual({ sent: 0, gone: [], failed: 0 })
    expect(sendEachForMulticast).not.toHaveBeenCalled()
  })
})
