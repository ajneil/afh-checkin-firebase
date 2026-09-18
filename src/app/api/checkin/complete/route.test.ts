import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGet = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/db/firestore', () => ({
  checkInsCollection: () => ({
    doc: () => ({ get: mockGet, update: mockUpdate }),
  }),
}))

function snapshot(data: Record<string, unknown> | null) {
  return {
    exists: data !== null,
    get: (field: string) => data?.[field] ?? null,
  }
}

async function makeRequest(body: Record<string, unknown>) {
  const { POST } = await import('./route')
  const request = new Request('http://localhost/api/checkin/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return POST(request)
}

describe('POST /api/checkin/complete', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockUpdate.mockResolvedValue(undefined)
  })

  it('saves all fields and sets completedAt with valid token and responses', async () => {
    mockGet.mockResolvedValue(snapshot({ completedAt: null }))
    const res = await makeRequest({
      token: 'tok-abc',
      reflection: 'Calm',
      gratitude: 'Sunshine',
      intention: 'Go for a walk',
    })
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        reflection: 'Calm',
        gratitude: 'Sunshine',
        intention: 'Go for a walk',
        completedAt: expect.any(Date),
      })
    )
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('returns 400 when token is missing', async () => {
    const res = await makeRequest({ reflection: 'x', gratitude: 'y', intention: 'z' })
    expect(res.status).toBe(400)
  })

  it('returns 404 when token is unknown', async () => {
    mockGet.mockResolvedValue(snapshot(null))
    const res = await makeRequest({ token: 'bad-token', reflection: 'x', gratitude: 'y', intention: 'z' })
    expect(res.status).toBe(404)
  })

  it('returns 400 when check-in is already completed', async () => {
    mockGet.mockResolvedValue(snapshot({ completedAt: new Date() }))
    const res = await makeRequest({ token: 'tok-done', reflection: 'x', gratitude: 'y', intention: 'z' })
    expect(res.status).toBe(400)
  })
})
