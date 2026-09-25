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
        <p className="rounded-2xl p-6 text-lg leading-relaxed" style={{ background: '#BEE6F2', color: '#111111' }}>
          {prompt}
        </p>
      )}
      <CheckInFlow token={token} />
    </div>
  )
}
