'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CheckInFlow } from '../CheckInFlow'

type Status = 'loading' | 'pending' | 'completed' | 'not_found' | 'error'

type Props = { token: string }

export function CheckInLoader({ token }: Props) {
  const [status, setStatus] = useState<Status>('loading')
  const [prompt, setPrompt] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/checkin/${token}`)
      .then((res) => res.json())
      .then((data: { status: string; prompt?: string | null }) => {
        setPrompt(data.prompt ?? null)
        if (data.status === 'pending') setStatus('pending')
        else if (data.status === 'completed') setStatus('completed')
        else setStatus('not_found')
      })
      .catch(() => setStatus('error'))
  }, [token])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-base" style={{ color: '#888' }}>Loading…</p>
      </div>
    )
  }

  if (status === 'not_found' || status === 'error') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-16">
        <p className="text-5xl">🔍</p>
        <h1 className="text-2xl font-bold" style={{ color: '#111111' }}>
          This link isn&apos;t valid
        </h1>
        <p className="text-base" style={{ color: '#555' }}>
          It may have expired or been used already. Check your email for a fresh link.
        </p>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-16">
        <p className="text-5xl">🌟</p>
        <h1 className="text-2xl font-bold" style={{ color: '#111111' }}>
          You&apos;ve already completed today&apos;s check-in
        </h1>
        <p className="text-base" style={{ color: '#555' }}>
          Brilliant work. Take a breath and carry that intention with you today. See you tomorrow!
        </p>
        <Link href="/" className="font-bold underline" style={{ color: '#E1446F' }}>
          See your check-ins
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {prompt && (
        <section className="prompt-card" aria-label="This morning">
          <span className="prompt-sun" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#E1446F' }}>
              This morning
            </p>
            <p className="text-lg leading-relaxed mt-1" style={{ color: '#111111' }}>
              {prompt}
            </p>
          </div>
          <svg className="prompt-leaves" viewBox="0 0 80 80" aria-hidden="true">
            <path d="M40 76C40 50 50 30 72 22c0 26-12 44-32 54Z" fill="#bfe3d0" />
            <path d="M40 76C38 54 26 38 8 32c2 24 14 38 32 44Z" fill="#cde6f5" />
            <path d="M40 76 64 32M40 76 16 40" stroke="#9ccbb3" strokeWidth="1.2" fill="none" />
          </svg>
        </section>
      )}
      <CheckInFlow token={token} />
    </div>
  )
}
