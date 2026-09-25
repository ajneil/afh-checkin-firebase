import { timingSafeEqual } from 'node:crypto'
import { NextRequest } from 'next/server'
import { sendMorningEmails } from '@/lib/morning/sendMorningEmails'

export const dynamic = 'force-dynamic'

function authorised(header: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || !header) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const given = Buffer.from(header)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/** Called hourly at :30 by Cloud Scheduler with `Authorization: Bearer $CRON_SECRET`. */
export async function POST(request: NextRequest) {
  if (!authorised(request.headers.get('authorization'))) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 })
  }
  try {
    return Response.json(await sendMorningEmails(new Date()))
  } catch (error) {
    console.error('Morning job failed', error)
    return Response.json({ error: 'Morning job failed' }, { status: 500 })
  }
}
