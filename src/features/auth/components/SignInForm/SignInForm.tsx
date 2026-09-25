'use client'

import { useState } from 'react'

type Props = {
  onGoogle: () => Promise<void>
  onEmailLink: (data: { name: string; email: string }) => Promise<void>
}

const inputClass =
  'rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#E1446F]'

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
        <p className="text-2xl font-bold" style={{ color: '#96C85B' }}>Check your inbox 🌱</p>
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
        className="rounded-xl px-6 py-4 text-base font-bold transition-opacity disabled:opacity-50 border border-gray-200"
        style={{ background: '#FFFDF8', color: '#111111' }}
      >
        {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
      </button>

      <p className="text-center text-sm" style={{ color: '#555' }}>
        or use any email address
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
            style={{ background: '#FFFDF8', color: '#111111' }}
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
            style={{ background: '#FFFDF8', color: '#111111' }}
            autoComplete="email"
          />
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSend}
          className="rounded-xl px-6 py-4 text-base font-bold text-white transition-opacity disabled:opacity-50"
          style={{ background: '#E1446F' }}
        >
          {busy === 'email' ? 'Sending…' : 'Email me a sign-in link'}
        </button>
      </form>
    </div>
  )
}
