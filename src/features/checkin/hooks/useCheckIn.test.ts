import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCheckIn } from './useCheckIn'

describe('useCheckIn', () => {
  it('initial step is 1', () => {
    const { result } = renderHook(() => useCheckIn('tok-abc'))
    expect(result.current.step).toBe(1)
  })

  it('nextStep increments step from 1 to 2', () => {
    const { result } = renderHook(() => useCheckIn('tok-abc'))
    act(() => { result.current.nextStep() })
    expect(result.current.step).toBe(2)
  })

  it('nextStep increments step from 2 to 3', () => {
    const { result } = renderHook(() => useCheckIn('tok-abc'))
    act(() => { result.current.nextStep() })
    act(() => { result.current.nextStep() })
    expect(result.current.step).toBe(3)
  })

  it('nextStep increments step from 3 to 4', () => {
    const { result } = renderHook(() => useCheckIn('tok-abc'))
    act(() => { result.current.nextStep() })
    act(() => { result.current.nextStep() })
    act(() => { result.current.nextStep() })
    expect(result.current.step).toBe(4)
  })

  it('cannot advance past step 4', () => {
    const { result } = renderHook(() => useCheckIn('tok-abc'))
    act(() => { result.current.nextStep() })
    act(() => { result.current.nextStep() })
    act(() => { result.current.nextStep() })
    act(() => { result.current.nextStep() })
    expect(result.current.step).toBe(4)
  })

  it('setField updates the reflection field', () => {
    const { result } = renderHook(() => useCheckIn('tok-abc'))
    act(() => { result.current.setField('reflection', 'Feeling good') })
    expect(result.current.fields.reflection).toBe('Feeling good')
  })

  it('setField updates the gratitude field', () => {
    const { result } = renderHook(() => useCheckIn('tok-abc'))
    act(() => { result.current.setField('gratitude', 'Sunshine') })
    expect(result.current.fields.gratitude).toBe('Sunshine')
  })

  it('setField updates the intention field', () => {
    const { result } = renderHook(() => useCheckIn('tok-abc'))
    act(() => { result.current.setField('intention', 'Go for a walk') })
    expect(result.current.fields.intention).toBe('Go for a walk')
  })
})
