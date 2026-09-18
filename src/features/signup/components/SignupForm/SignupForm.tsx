'use client'

import { useState } from 'react'

type Props = {
  onSubmit: (data: { name: string; email: string }) => Promise<void>
}

export function SignupForm({ onSubmit }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = name.trim().length > 0 && email.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), email: email.trim() })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="text-2xl font-bold" style={{ color: '#96C85B' }}>Check your inbox 🌱</p>
        <p className="mt-2 text-base" style={{ color: '#111111' }}>
          Your first check-in email is on its way.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
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
          className="rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#E1446F]"
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
          className="rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#E1446F]"
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
        disabled={!isValid || submitting}
        className="rounded-xl px-6 py-4 text-base font-bold text-white transition-opacity disabled:opacity-50"
        style={{ background: '#E1446F' }}
      >
        {submitting ? 'Sending…' : 'Start your daily check-in'}
      </button>
    </form>
  )
}
