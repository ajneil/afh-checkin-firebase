import { beforeEach, describe, expect, it, vi } from 'vitest'

let current: { email: string } | null
vi.mock('@/lib/auth/currentUser', () => ({ getCurrentUser: async () => current }))
const saveDevice = vi.fn(async () => {})
const removeDevice = vi.fn(async () => {})
vi.mock('@/lib/push/devices', () => ({ saveDevice, removeDevice }))

const { POST, DELETE } = await import('./route')
const call = (fn: typeof POST, body: unknown) =>
  fn(new Request('http://localhost/api/push', { method: 'POST', body: JSON.stringify(body) }) as never)
const token = 'x'.repeat(152)

describe('/api/push', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    current = { email: 'alex@example.com' }
  })

  it('registers this device for the signed-in person', async () => {
    expect((await call(POST, { token })).status).toBe(200)
    expect(saveDevice).toHaveBeenCalledWith('alex@example.com', token)
  })

  it('unregisters a device', async () => {
    expect((await call(DELETE, { token })).status).toBe(200)
    expect(removeDevice).toHaveBeenCalledWith('alex@example.com', token)
  })

  it('requires sign-in', async () => {
    current = null
    expect((await call(POST, { token })).status).toBe(401)
    expect(saveDevice).not.toHaveBeenCalled()
  })

  it.each([{}, { token: 5 }, { token: 'short' }, { token: 'y'.repeat(5000) }])('rejects %o', async (body) => {
    expect((await call(POST, body)).status).toBe(400)
  })
})
