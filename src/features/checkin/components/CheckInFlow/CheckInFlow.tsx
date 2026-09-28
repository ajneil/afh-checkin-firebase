'use client'

import { Celebration } from '@/components/decor'
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
      <Celebration title="Well done, you!" cta={{ href: '/', label: 'See your check-ins' }}>
        You&apos;ve completed today&apos;s check-in. Carry that intention with you — it matters
        more than you think.
      </Celebration>
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
