import { adminMessaging } from '@/lib/db/firestore'

const GONE = new Set(['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'])

export type PushMessage = { title: string; body: string; url: string }

/**
 * Data-only web push: the service worker always shows it (Safari requires that)
 * and opens `url` on tap. Expires after 3 hours, since a stale nudge is no help.
 */
export async function sendPush(tokens: string[], message: PushMessage) {
  const result = { sent: 0, gone: [] as string[], failed: 0 }
  if (tokens.length === 0) return result
  const { responses } = await adminMessaging().sendEachForMulticast({
    tokens,
    webpush: { headers: { TTL: '10800', Urgency: 'normal' }, data: message },
  })
  responses.forEach((r, i) => {
    if (r.success) result.sent++
    else if (GONE.has(r.error?.code ?? '')) result.gone.push(tokens[i])
    else result.failed++
  })
  return result
}
