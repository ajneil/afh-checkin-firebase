'use client'

import { useState } from 'react'

type Props = {
  onGoogle: () => Promise<void>
  onEmailLink: (data: { name: string; email: string }) => Promise<void>
}

const inputClass = 'soft-input'

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8Z" />
    <path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.8C3.9 20.5 7.7 23 12 23Z" />
    <path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.4-.4-2s.2-1.3.4-2V7.2H2C1.4 8.7 1 10.3 1 12s.4 3.3 1 4.8L5.7 14Z" />
    <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.5 2 7.2L5.7 10c.9-2.6 3.4-4.6 6.3-4.6Z" />
  </svg>
)

export function SignInForm({ onGoogle, onEmailLink }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<'google' | 'email' | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canSend = name.trim().length > 0 && email.trim().length > 0 && !busy

  async function run(kind: 'google' | 'email', action: () => Promise<void>) {
    setBusy(kind)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  if (sentTo) {
    return (
      <div className="text-center py-8">
        <p className="text-2xl font-bold" style={{ color: '#4f8a3f' }}>Check your inbox 🌱</p>
        <p className="mt-2 text-base" style={{ color: '#111111' }}>
          We&apos;ve sent a sign-in link to <strong>{sentTo}</strong>. Open it on this device to continue.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => run('google', onGoogle)}
        disabled={busy !== null}
        className="pill-button pill-button-quiet w-full"
      >
        <GoogleLogo />
        {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
      </button>

      <p className="flex items-center gap-3 text-sm" style={{ color: '#5b6470' }}>
        <span className="h-px flex-1 bg-black/10" />
        or use any email address
        <span className="h-px flex-1 bg-black/10" />
      </p>

      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (!canSend) return
          const data = { name: name.trim(), email: email.trim() }
          void run('email', async () => {
            await onEmailLink(data)
            setSentTo(data.email)
          })
        }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold text-base" style={{ color: '#111111' }}>
            Your name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex"
            className={inputClass}
            autoComplete="name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-semibold text-base" style={{ color: '#111111' }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            autoComplete="email"
          />
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={!canSend} className="pill-button w-full">
          {busy === 'email' ? 'Sending…' : 'Email me a sign-in link'}
        </button>
      </form>
    </div>
  )
}
