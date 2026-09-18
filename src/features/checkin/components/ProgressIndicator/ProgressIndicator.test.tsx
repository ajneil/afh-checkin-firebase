import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressIndicator } from './ProgressIndicator'

describe('ProgressIndicator', () => {
  it('renders 4 step indicators', () => {
    render(<ProgressIndicator currentStep={1} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('marks the current step as active', () => {
    render(<ProgressIndicator currentStep={2} />)
    const items = screen.getAllByRole('listitem')
    expect(items[1]).toHaveAttribute('aria-current', 'step')
  })

  it('marks completed steps as done', () => {
    render(<ProgressIndicator currentStep={3} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('data-completed', 'true')
    expect(items[1]).toHaveAttribute('data-completed', 'true')
    expect(items[2]).not.toHaveAttribute('data-completed', 'true')
  })
})
