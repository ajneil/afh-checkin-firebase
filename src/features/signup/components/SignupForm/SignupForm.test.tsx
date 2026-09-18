import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from './SignupForm'

describe('SignupForm', () => {
  it('renders name field, email field, and submit button', () => {
    render(<SignupForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })

  it('submit button is disabled while fields are empty', () => {
    render(<SignupForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()
  })

  it('calls onSubmit with { name, email } when submitted with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<SignupForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/name/i), 'Alex')
    await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
    await user.click(screen.getByRole('button', { name: /start/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Alex', email: 'alex@example.com' })
    })
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    let resolve: () => void
    const onSubmit = vi.fn().mockReturnValue(new Promise<void>((r) => { resolve = r }))
    render(<SignupForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/name/i), 'Alex')
    await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled()
    })
    resolve!()
  })

  it('shows success state after successful submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<SignupForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/name/i), 'Alex')
    await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
    await user.click(screen.getByRole('button', { name: /start/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument()
    })
  })

  it('shows an error message if onSubmit throws', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('Already registered'))
    render(<SignupForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/name/i), 'Alex')
    await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
    await user.click(screen.getByRole('button', { name: /start/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/already registered/i)).toBeInTheDocument()
    })
  })
})
