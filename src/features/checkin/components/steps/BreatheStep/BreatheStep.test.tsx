import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
