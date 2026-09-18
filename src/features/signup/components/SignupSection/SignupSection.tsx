'use client'

import { SignupForm } from '../SignupForm'

export function SignupSection() {
  async function handleSubmit({ name, email }: { name: string; email: string }) {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? 'Something went wrong. Please try again.')
    }
  }

  return <SignupForm onSubmit={handleSubmit} />
}
