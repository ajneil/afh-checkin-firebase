'use client'

import { useEffect, useState } from 'react'
import { IconBubble } from '@/components/decor'
import { pushStatus, type PushStatus } from '../../utils/pushStatus'
import { disablePush, enablePush, isPushSupported, pushConfigured, refreshPush, savedPushToken } from '../../utils/push'

const NOTES: Partial<Record<PushStatus, string>> = {
  install:
    'For morning notifications on iPhone, open this site in Safari, tap Share → Add to Home Screen, then open the app from your Home Screen.',
  unsupported: 'This browser can’t show notifications. The morning email still works.',
  blocked: 'Notifications are blocked for this site. Allow them in your browser or phone settings to get a morning nudge.',
}

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20.5a2 2 0 0 0 4 0" />
  </svg>
)

type ViewProps = { status: PushStatus; busy: boolean; error: string; onToggle: () => void }

/** Presentational: the settings row for morning notifications. */
export function PushToggleView({ status, busy, error, onToggle }: ViewProps) {
  if (status === 'hidden') return null
  const on = status === 'on'
  const note = NOTES[status]
  return (
    <div className="soft-card p-5 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-3">
          <IconBubble tone="pink">
            <BellIcon />
          </IconBubble>
          <div>
            <p className="font-semibold" style={{ color: '#14213d' }}>
              Morning notifications
            </p>
            <p className="text-sm" style={{ color: '#5b6470' }}>
              {on ? 'On for this device, at around 7:30.' : note ?? 'A gentle nudge on this device at around 7:30.'}
            </p>
          </div>
        </div>
        {!note && (
          <button
            type="button"
            onClick={onToggle}
            disabled={busy}
            aria-pressed={on}
            className="pill-button pill-button-quiet self-start sm:self-auto text-sm whitespace-nowrap"
          >
            {busy ? 'Saving…' : on ? 'Turn off notifications' : 'Turn on notifications'}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm" style={{ color: '#991B1B' }}>
          {error}
        </p>
      )}
    </div>
  )
}

/** Stateful wrapper: reads the browser's capabilities and talks to /api/push. */
export function PushToggle() {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [enabled, setEnabled] = useState(false)
  const [env, setEnv] = useState({ appleMobile: false, standalone: false })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    void isPushSupported().then((ok) => {
      if (!live) return
      setEnv({
        appleMobile:
          /iPhone|iPad|iPod/.test(navigator.userAgent) ||
          (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1),
        standalone: window.matchMedia('(display-mode: standalone)').matches,
      })
      setSupported(ok)
      if (!ok) return
      setPermission(Notification.permission)
      const on = Boolean(savedPushToken())
      setEnabled(on)
      // Tokens rotate: refresh quietly on each visit.
      if (on && Notification.permission === 'granted') refreshPush().catch(() => {})
    })
    return () => {
      live = false
    }
  }, [])

  const status = pushStatus({ configured: pushConfigured, supported, permission, enabled, ...env })
  return (
    <PushToggleView
      status={status}
      busy={busy}
      error={error}
      onToggle={async () => {
        setBusy(true)
        setError('')
        try {
          if (status === 'on') {
            await disablePush()
            setEnabled(false)
          } else {
            const result = await Notification.requestPermission()
            setPermission(result)
            if (result === 'granted') {
              await enablePush()
              setEnabled(true)
            }
          }
        } catch {
          setError('Notifications couldn’t be changed. Check your connection and try again.')
        } finally {
          setBusy(false)
        }
      }}
    />
  )
}
