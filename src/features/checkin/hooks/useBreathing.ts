import { useEffect, useState } from 'react'

export type BreathPhase = 'idle' | 'in' | 'hold' | 'out' | 'done'
export const PHASE_SECONDS = 4
const ORDER: BreathPhase[] = ['in', 'hold', 'out']

type State = { phase: BreathPhase; count: number; round: number }
const IDLE: State = { phase: 'idle', count: 0, round: 0 }

/** Box-style breathing: in, hold, out for 4 seconds each, for `rounds` breaths. */
export function useBreathing(rounds: number) {
  const [state, setState] = useState<State>(IDLE)
  const running = state.phase === 'in' || state.phase === 'hold' || state.phase === 'out'

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setState((s) => {
        if (s.count < PHASE_SECONDS) return { ...s, count: s.count + 1 }
        const next = ORDER.indexOf(s.phase) + 1
        if (next < ORDER.length) return { ...s, phase: ORDER[next], count: 1 }
        if (s.round < rounds) return { phase: 'in', count: 1, round: s.round + 1 }
        return { phase: 'done', count: 0, round: s.round }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running, rounds])

  return {
    ...state,
    rounds,
    start: () => setState({ phase: 'in', count: 1, round: 1 }),
  }
}
