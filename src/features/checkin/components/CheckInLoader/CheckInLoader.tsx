'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowIcon, Celebration, IconBubble, Sprig } from '@/components/decor'
import { CheckInFlow } from '../CheckInFlow'
import { PromptCard } from '../PromptCard'

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
        <p className="text-base animate-pulse" style={{ color: '#5b6470' }}>
          Getting your check-in ready…
        </p>
      </div>
    )
  }

  if (status === 'not_found' || status === 'error') {
    return (
      <div className="soft-card soft-card-blue px-6 py-12 text-center flex flex-col items-center gap-4">
        <IconBubble tone="blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
          </svg>
        </IconBubble>
        <h1 className="text-2xl font-bold" style={{ color: '#14213d' }}>
          This link isn&apos;t valid
        </h1>
        <p className="text-base max-w-sm" style={{ color: '#5b6470' }}>
          It may have expired or been used already. Check your email for a fresh link.
        </p>
        <Link href="/" className="pill-button mt-2">
          Go to your check-ins
          <ArrowIcon />
        </Link>
        <Sprig className="absolute -right-2 -bottom-2 w-20 opacity-70" tone="blue" />
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <Celebration level={1} title="You've already completed today's check-in" cta={{ href: '/', label: 'See your check-ins' }}>
        Brilliant work. Take a breath and carry that intention with you today. See you tomorrow!
      </Celebration>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {prompt && <PromptCard prompt={prompt} />}
      <CheckInFlow token={token} />
    </div>
  )
}
