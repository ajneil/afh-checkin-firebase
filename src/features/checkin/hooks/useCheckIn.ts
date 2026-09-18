import { useState } from 'react'

type Step = 1 | 2 | 3 | 4

type Fields = {
  reflection: string
  gratitude: string
  intention: string
}

type FieldKey = keyof Fields

export function useCheckIn(token: string) {
  const [step, setStep] = useState<Step>(1)
  const [fields, setFields] = useState<Fields>({ reflection: '', gratitude: '', intention: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function nextStep() {
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s))
  }

  function setField(key: FieldKey, value: string) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/checkin/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...fields }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Something went wrong.')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return { step, nextStep, fields, setField, submitting, submitted, error, handleSubmit }
}
