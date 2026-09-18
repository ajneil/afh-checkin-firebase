import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntentionStep } from './IntentionStep'

describe('IntentionStep', () => {
  it('renders the correct heading', () => {
    render(<IntentionStep value="" onChange={vi.fn()} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByRole('heading', { name: /one thing/i })).toBeInTheDocument()
  })

  it('renders a textarea', () => {
    render(<IntentionStep value="" onChange={vi.fn()} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<IntentionStep value="" onChange={onChange} onSubmit={vi.fn()} submitting={false} />)
    await user.type(screen.getByRole('textbox'), 'C')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders a Submit button', () => {
    render(<IntentionStep value="" onChange={vi.fn()} onSubmit={vi.fn()} submitting={false} />)
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('calls onSubmit when Submit is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<IntentionStep value="something" onChange={vi.fn()} onSubmit={onSubmit} submitting={false} />)
    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('disables submit button while submitting', () => {
    render(<IntentionStep value="" onChange={vi.fn()} onSubmit={vi.fn()} submitting={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
