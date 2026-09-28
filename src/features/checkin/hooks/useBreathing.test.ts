import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useBreathing, PHASE_SECONDS } from './useBreathing'

describe('useBreathing', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const tick = (seconds: number) => act(() => void vi.advanceTimersByTime(seconds * 1000))

  it('waits on the start screen until started', () => {
    const { result } = renderHook(() => useBreathing(3))
    tick(10)
    expect(result.current.phase).toBe('idle')
  })

  it('counts 1 to 4 through breathe in, hold and breathe out', () => {
    const { result } = renderHook(() => useBreathing(3))
    act(() => result.current.start())
    expect(result.current).toMatchObject({ phase: 'in', count: 1, round: 1 })
    tick(3)
    expect(result.current).toMatchObject({ phase: 'in', count: 4 })
    tick(1)
    expect(result.current).toMatchObject({ phase: 'hold', count: 1 })
    tick(PHASE_SECONDS)
    expect(result.current).toMatchObject({ phase: 'out', count: 1 })
  })

  it('repeats for the requested number of breaths, then finishes', () => {
    const { result } = renderHook(() => useBreathing(2))
    act(() => result.current.start())
    tick(PHASE_SECONDS * 3)
    expect(result.current).toMatchObject({ phase: 'in', round: 2 })
    tick(PHASE_SECONDS * 3)
    expect(result.current.phase).toBe('done')
    tick(20)
    expect(result.current.phase).toBe('done')
  })

  it('can start again after finishing', () => {
    const { result } = renderHook(() => useBreathing(1))
    act(() => result.current.start())
    tick(PHASE_SECONDS * 3)
    act(() => result.current.start())
    expect(result.current).toMatchObject({ phase: 'in', count: 1, round: 1 })
  })

  it('stops its timer when unmounted', () => {
    const { result, unmount } = renderHook(() => useBreathing(3))
    act(() => result.current.start())
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
