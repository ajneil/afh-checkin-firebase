import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSendMail = vi.fn().mockResolvedValue({})
const mockCreateTransport = vi.fn().mockReturnValue({ sendMail: mockSendMail })

vi.mock('nodemailer', () => ({
  default: { createTransport: mockCreateTransport },
}))

describe('sendEmail', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.SMTP_HOST = 'test-smtp-host'
    process.env.SMTP_PORT = '1025'
  })

  it('calls createTransport with correct SMTP host and port from env vars', async () => {
    const { sendEmail } = await import('./mailer')
    await sendEmail('to@example.com', 'Subject', '<p>html</p>')

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'test-smtp-host',
      port: 1025,
    })
  })

  it('calls sendMail with correct from, to, and subject fields', async () => {
    const { sendEmail } = await import('./mailer')
    await sendEmail('to@example.com', 'Hello World', '<p>html</p>')

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.stringContaining('@'),
        to: 'to@example.com',
        subject: 'Hello World',
      })
    )
  })
})
