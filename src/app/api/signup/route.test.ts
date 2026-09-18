import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUserCreate = vi.fn()
const mockCheckInCreate = vi.fn()

vi.mock('@/lib/db/firestore', () => ({
  usersCollection: () => ({
    doc: () => ({ create: mockUserCreate }),
  }),
  checkInsCollection: () => ({
    doc: () => ({ create: mockCheckInCreate }),
  }),
}))

const mockSendEmail = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/email/mailer', () => ({
  sendEmail: mockSendEmail,
}))

vi.mock('@/lib/email/templates/welcome', () => ({
  welcomeEmail: (name: string) => `<p>Welcome ${name}</p>`,
}))

vi.mock('@/lib/email/templates/checkin', () => ({
  checkInEmail: (name: string, url: string) => `<a href="${url}">Check in ${name}</a>`,
}))

async function makeRequest(body: Record<string, unknown>) {
  const { POST } = await import('./route')
  const request = new Request('http://localhost/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return POST(request)
}

describe('POST /api/signup', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.APP_URL = 'http://localhost:3000'

    mockUserCreate.mockResolvedValue(undefined)
    mockCheckInCreate.mockResolvedValue(undefined)
  })

  it('creates a User and CheckIn record with valid name and email', async () => {
    const res = await makeRequest({ name: 'Alex', email: 'alex@example.com' })
    expect(res.status).toBe(200)
    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alex@example.com' })
    )
    expect(mockCheckInCreate).toHaveBeenCalledOnce()
  })

  it('normalizes email to lowercase', async () => {
    await makeRequest({ name: 'Alex', email: 'Alex@Example.COM' })
    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alex@example.com' })
    )
  })

  it('sends a welcome email with valid data', async () => {
    await makeRequest({ name: 'Alex', email: 'alex@example.com' })
    expect(mockSendEmail).toHaveBeenCalledWith(
      'alex@example.com',
      expect.any(String),
      expect.stringContaining('Alex')
    )
  })

  it('sends a check-in email with valid data', async () => {
    await makeRequest({ name: 'Alex', email: 'alex@example.com' })
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
  })

  it('returns 400 when name is missing', async () => {
    const res = await makeRequest({ email: 'alex@example.com' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when email is missing', async () => {
    const res = await makeRequest({ name: 'Alex' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when email is not a valid format', async () => {
    const res = await makeRequest({ name: 'Alex', email: 'not-an-email' })
    expect(res.status).toBe(400)
    expect(mockUserCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when email is already registered', async () => {
    mockUserCreate.mockRejectedValue(new Error('ALREADY_EXISTS'))
    const res = await makeRequest({ name: 'Alex', email: 'alex@example.com' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('reports emailDelivered: false without failing the signup when email sending throws', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('SMTP down'))
    const res = await makeRequest({ name: 'Alex', email: 'alex@example.com' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.emailDelivered).toBe(false)
  })
})
