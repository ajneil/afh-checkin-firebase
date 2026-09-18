import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReflectStep } from './ReflectStep'

describe('ReflectStep', () => {
  it('renders the correct heading', () => {
    render(<ReflectStep value="" onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /how are you feeling/i })).toBeInTheDocument()
  })

  it('renders a textarea', () => {
    render(<ReflectStep value="" onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ReflectStep value="" onChange={onChange} onNext={vi.fn()} />)
    await user.type(screen.getByRole('textbox'), 'A')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders a Next button', () => {
    render(<ReflectStep value="" onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('calls onNext when Next is clicked', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<ReflectStep value="something" onChange={vi.fn()} onNext={onNext} />)
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledOnce()
  })
})
