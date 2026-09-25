import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInForm } from './SignInForm'

const setup = (over: Partial<Parameters<typeof SignInForm>[0]> = {}) => {
  const props = {
    onGoogle: vi.fn().mockResolvedValue(undefined),
    onEmailLink: vi.fn().mockResolvedValue(undefined),
    ...over,
  }
  render(<SignInForm {...props} />)
  return { ...props, user: userEvent.setup() }
}

describe('SignInForm', () => {
  it('offers Google and name-and-email sign-in', () => {
    setup()
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })

  it('signs in with Google', async () => {
    const { onGoogle, user } = setup()
    await user.click(screen.getByRole('button', { name: /continue with google/i }))
    expect(onGoogle).toHaveBeenCalledOnce()
  })

  it('keeps the email button disabled until both fields are filled', async () => {
    const { user } = setup()
    const button = screen.getByRole('button', { name: /email me a sign-in link/i })
    expect(button).toBeDisabled()
    await user.type(screen.getByLabelText(/your name/i), 'Alex')
    expect(button).toBeDisabled()
    await user.type(screen.getByLabelText(/email address/i), 'alex@example.com')
    expect(button).toBeEnabled()
  })

  it('sends a sign-in link and tells the person to check their inbox', async () => {
    const { onEmailLink, user } = setup()
    await user.type(screen.getByLabelText(/your name/i), ' Alex ')
    await user.type(screen.getByLabelText(/email address/i), 'alex@example.com ')
    await user.click(screen.getByRole('button', { name: /email me a sign-in link/i }))
    expect(onEmailLink).toHaveBeenCalledWith({ name: 'Alex', email: 'alex@example.com' })
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument()
    expect(screen.getByText(/alex@example.com/)).toBeInTheDocument()
  })

  it('shows an error when sending the link fails', async () => {
    const { user } = setup({ onEmailLink: vi.fn().mockRejectedValue(new Error('Please enter a valid email address')) })
    await user.type(screen.getByLabelText(/your name/i), 'Alex')
    await user.type(screen.getByLabelText(/email address/i), 'nope')
    await user.click(screen.getByRole('button', { name: /email me a sign-in link/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i)
  })

  it('shows an error when Google sign-in fails', async () => {
    const { user } = setup({ onGoogle: vi.fn().mockRejectedValue(new Error('Google sign-in was blocked')) })
    await user.click(screen.getByRole('button', { name: /continue with google/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/blocked/i))
  })
})
