import nodemailer from 'nodemailer'

const port = Number(process.env.SMTP_PORT)
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  // Production providers (e.g. Resend, Brevo) need a login; local Mailpit does not.
  ...(process.env.SMTP_USER
    ? { secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
    : {}),
})

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await transport.sendMail({
    // Gmail and most providers only send as the signed-in account, so default to it.
    from:
      process.env.MAIL_FROM ||
      (process.env.SMTP_USER
        ? `Daily Check-In <${process.env.SMTP_USER}>`
        : 'Daily Check-In <checkin@actionforhappiness.org>'),
    to,
    subject,
    html,
  })
}
