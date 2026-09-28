import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BreatheStep } from './BreatheStep'

describe('BreatheStep', () => {
  it('renders a heading with breathe content', () => {
    render(<BreatheStep onNext={vi.fn()} />)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('renders an "I\'m ready" button', () => {
    render(<BreatheStep onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /i'm ready/i })).toBeInTheDocument()
  })

  it('calls onNext when the button is clicked', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<BreatheStep onNext={onNext} />)
    await user.click(screen.getByRole('button', { name: /i'm ready/i }))
    expect(onNext).toHaveBeenCalledOnce()
  })
})

describe('BreatheStep animation', () => {
  const tick = (s: number) => act(() => void vi.advanceTimersByTime(s * 1000))
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts on a calm start screen', () => {
    render(<BreatheStep onNext={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /let's start with a breath/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })

  it('guides through breathe in, hold and breathe out with a count', () => {
    render(<BreatheStep onNext={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    expect(screen.getByRole('heading', { name: 'Breathe in' })).toBeInTheDocument()
    expect(screen.getByText(/breathe in through your nose/i)).toBeInTheDocument()
    expect(screen.getByTestId('breath-count')).toHaveTextContent('1')
    tick(4)
    expect(screen.getByRole('heading', { name: 'Hold' })).toBeInTheDocument()
    tick(4)
    expect(screen.getByRole('heading', { name: 'Breathe out' })).toBeInTheDocument()
    expect(screen.getByText(/breath 1 of 3/i)).toBeInTheDocument()
  })

  it('announces each phase to screen readers', () => {
    render(<BreatheStep onNext={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/breathe in/i)
  })

  it('finishes after three breaths and moves on when ready', () => {
    const onNext = vi.fn()
    render(<BreatheStep onNext={onNext} />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    tick(36)
    expect(screen.getByRole('heading', { name: /nicely done/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /i'm ready/i }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('can be skipped part-way through', () => {
    const onNext = vi.fn()
    render(<BreatheStep onNext={onNext} />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    tick(5)
    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('exposes the phase for styling', () => {
    const { container } = render(<BreatheStep onNext={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    tick(4)
    expect(container.querySelector('[data-phase="hold"]')).not.toBeNull()
  })
})
