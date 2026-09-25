'use client'

import Link from 'next/link'
import { useCheckIn } from '../../hooks/useCheckIn'
import { ProgressIndicator } from '../ProgressIndicator'
import { BreatheStep } from '../steps/BreatheStep'
import { ReflectStep } from '../steps/ReflectStep'
import { GratitudeStep } from '../steps/GratitudeStep'
import { IntentionStep } from '../steps/IntentionStep'

type Props = { token: string }

export function CheckInFlow({ token }: Props) {
  const { step, nextStep, fields, setField, submitting, submitted, error, handleSubmit } =
    useCheckIn(token)

  if (submitted) {
    return (
      <div
        className="animate-fade-in flex flex-col items-center text-center gap-6 rounded-2xl p-10"
        style={{ background: '#F9E78B' }}
      >
        <p className="text-6xl" role="img" aria-label="Star">🌟</p>
        <h2 className="text-2xl font-bold" style={{ color: '#111111' }}>
          Well done, you!
        </h2>
        <p className="text-base leading-relaxed max-w-xs" style={{ color: '#444' }}>
          You&apos;ve completed today&apos;s check-in. Carry that intention with you — it matters more than you think.
        </p>
        <Link href="/" className="font-bold underline" style={{ color: '#E1446F' }}>
          See your check-ins
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <ProgressIndicator currentStep={step} />

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: '#FEE2E2', color: '#991B1B' }}
        >
          {error}
        </div>
      )}

      <div className="animate-fade-in" key={step}>
        {step === 1 && <BreatheStep onNext={nextStep} />}
        {step === 2 && (
          <ReflectStep
            value={fields.reflection}
            onChange={(v) => setField('reflection', v)}
            onNext={nextStep}
          />
        )}
        {step === 3 && (
          <GratitudeStep
            value={fields.gratitude}
            onChange={(v) => setField('gratitude', v)}
            onNext={nextStep}
          />
        )}
        {step === 4 && (
          <IntentionStep
            value={fields.intention}
            onChange={(v) => setField('intention', v)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  )
}
