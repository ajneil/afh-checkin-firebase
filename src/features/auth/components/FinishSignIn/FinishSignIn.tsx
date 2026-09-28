'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { PendingSignIn } from '../../utils/signIn'

type Props = {
  isLink: boolean
  pending: PendingSignIn | null
  complete: (data: PendingSignIn) => Promise<void>
}

export function FinishSignIn({ isLink, pending, complete }: Props) {
  const [email, setEmail] = useState('')
  const [working, setWorking] = useState(Boolean(isLink && pending))
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  async function run(data: PendingSignIn) {
    setWorking(true)
    setError(null)
    try {
      await complete(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setWorking(false)
    }
  }

  useEffect(() => {
    if (!isLink || !pending || started.current) return
    started.current = true
    void run(pending)
    // Runs once for the stored sign-in; `run` is stable enough for this purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLink, pending])

  if (!isLink) {
    return (
      <div className="soft-card soft-card-blue flex flex-col items-center text-center gap-4 px-6 py-12">
        <h1 className="text-2xl font-bold" style={{ color: '#111111' }}>This sign-in link isn&apos;t valid</h1>
        <p className="text-base" style={{ color: '#555' }}>It may have expired or already been used.</p>
        <Link href="/" className="font-bold underline" style={{ color: '#E1446F' }}>Back to sign in</Link>
      </div>
    )
  }

  return (
    <div className="soft-card p-7 flex flex-col gap-6">
      {working ? (
        <p className="text-center text-base" style={{ color: '#555' }}>Signing you in…</p>
      ) : (
        !pending && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (email.trim()) void run({ email: email.trim(), name: '' })
            }}
          >
            <p className="text-base" style={{ color: '#111111' }}>
              For your security, please confirm the email address you used.
            </p>
            <label htmlFor="email" className="font-semibold text-base" style={{ color: '#111111' }}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="soft-input"
            />
            <button
              type="submit"
              disabled={!email.trim()}
              className="pill-button"
            >
              Continue
            </button>
          </form>
        )
      )}
      {error && (
        <div role="alert" className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FEE2E2', color: '#991B1B' }}>
          {error}{' '}
          <Link href="/" className="underline">Request a new link</Link>
        </div>
      )}
    </div>
  )
}
