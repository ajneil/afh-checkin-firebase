'use client'

import { useBreathing, type BreathPhase } from '../../../hooks/useBreathing'

type Props = { onNext: () => void }

const ROUNDS = 3

const COPY: Record<BreathPhase, { title: string; body: string }> = {
  idle: { title: "Let's start with a breath", body: 'Before we begin, take a few slow, deep breaths.' },
  in: { title: 'Breathe in', body: 'Slowly breathe in through your nose.' },
  hold: { title: 'Hold', body: 'Gently hold your breath.' },
  out: { title: 'Breathe out', body: 'Slowly breathe out through your mouth.' },
  done: { title: 'Nicely done', body: 'Take that calm with you into the next few minutes.' },
}

function Waves() {
  return (
    <svg className="breathe-waves" viewBox="0 0 2400 160" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="wave-back"
        d="M0 80 C150 40 450 40 600 80 S1050 120 1200 80 S1650 40 1800 80 S2250 120 2400 80 L2400 160 L0 160 Z"
      />
      <path
        className="wave-front"
        d="M0 112 C200 86 400 86 600 112 S1000 138 1200 112 S1600 86 1800 112 S2200 138 2400 112 L2400 160 L0 160 Z"
      />
    </svg>
  )
}

function Leaf({ className }: { className: string }) {
  return (
    <svg className={`breathe-leaf ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16Z" />
      <path d="M4 20 14 10" fill="none" strokeWidth="1.2" />
    </svg>
  )
}

export function BreatheStep({ onNext }: Props) {
  const breath = useBreathing(ROUNDS)
  const { phase, count, round } = breath
  const active = phase === 'in' || phase === 'hold' || phase === 'out'
  const copy = COPY[phase]

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div className="breathe-card w-full" data-phase={phase}>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#111111' }}>
            {copy.title}
          </h2>
          <p className="text-base" style={{ color: '#444' }}>
            {copy.body}
          </p>
        </div>

        <div className="breathe-stage" aria-hidden="true">
          <span className="breathe-ring breathe-ring-3" />
          <span className="breathe-ring breathe-ring-2" />
          <span className="breathe-ring breathe-ring-1" />
          <span className="breathe-orb">
            {active && (
              <span className="breathe-count">
                <b data-testid="breath-count">{count}</b>
                <small>/ 4</small>
              </span>
            )}
          </span>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n} className={`breathe-spark spark-${n}`} />
          ))}
          <Leaf className="leaf-1" />
          <Leaf className="leaf-2" />
          <Leaf className="leaf-3" />
          <Leaf className="leaf-4" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3">
          {active && (
            <p className="text-sm font-medium" style={{ color: '#555' }}>
              Breath {round} of {ROUNDS}
            </p>
          )}
          {phase === 'idle' && (
            <button
              onClick={breath.start}
              className="breathe-button rounded-full px-10 py-4 text-base font-bold text-white"
            >
              Start <span aria-hidden="true">→</span>
            </button>
          )}
          {phase === 'done' && (
            <button
              onClick={onNext}
              className="breathe-button rounded-full px-10 py-4 text-base font-bold text-white"
            >
              I&apos;m ready
            </button>
          )}
        </div>

        <Waves />
        <p role="status" className="sr-only">
          {phase === 'idle' ? '' : copy.title}
        </p>
      </div>

      {phase !== 'done' && (
        <button onClick={onNext} className="text-sm underline" style={{ color: '#555' }}>
          Skip, I&apos;m ready
        </button>
      )}
    </div>
  )
}
