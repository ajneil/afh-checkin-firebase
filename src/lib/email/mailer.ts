import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
})

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await transport.sendMail({
    from: 'Daily Check-In <checkin@actionforhappiness.org>',
    to,
    subject,
    html,
  })
}
