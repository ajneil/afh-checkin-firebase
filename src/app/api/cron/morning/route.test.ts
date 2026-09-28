import { beforeEach, describe, expect, it, vi } from 'vitest'

const sendMorningCheckIns = vi.fn(async () => ({ emailed: 2, pushed: 1, skipped: 1, failed: 0 }))
vi.mock('@/lib/morning/sendMorningCheckIns', () => ({ sendMorningCheckIns }))

const { POST } = await import('./route')
const call = (auth?: string) =>
  POST(
    new Request('http://localhost/api/cron/morning', {
      method: 'POST',
      headers: auth ? { Authorization: auth } : {},
    }) as never
  )

describe('POST /api/cron/morning', () => {
  beforeEach(() => {
    sendMorningCheckIns.mockClear()
    process.env.CRON_SECRET = 'a-long-shared-secret'
  })

  it('runs the morning job with the right secret', async () => {
    const res = await call('Bearer a-long-shared-secret')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ emailed: 2, pushed: 1, skipped: 1, failed: 0 })
    expect(sendMorningCheckIns).toHaveBeenCalledOnce()
  })

  it.each([undefined, 'Bearer wrong', 'a-long-shared-secret'])('rejects %s', async (auth) => {
    expect((await call(auth)).status).toBe(401)
    expect(sendMorningCheckIns).not.toHaveBeenCalled()
  })

  it('refuses to run at all when no secret is configured', async () => {
    delete process.env.CRON_SECRET
    expect((await call('Bearer ')).status).toBe(401)
  })
})
