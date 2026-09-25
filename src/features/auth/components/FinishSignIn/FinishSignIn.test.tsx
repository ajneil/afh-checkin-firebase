import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FinishSignIn } from './FinishSignIn'

describe('FinishSignIn', () => {
  it('completes straight away when the email was saved on this device', async () => {
    const complete = vi.fn().mockResolvedValue(undefined)
    render(<FinishSignIn isLink pending={{ email: 'alex@example.com', name: 'Alex' }} complete={complete} />)
    expect(await screen.findByText(/signing you in/i)).toBeInTheDocument()
    expect(complete).toHaveBeenCalledWith({ email: 'alex@example.com', name: 'Alex' })
  })

  it('asks for the email again when the link is opened on another device', async () => {
    const complete = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<FinishSignIn isLink pending={null} complete={complete} />)
    expect(complete).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText(/email address/i), 'alex@example.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(complete).toHaveBeenCalledWith({ email: 'alex@example.com', name: '' })
  })

  it('explains an invalid or used link', async () => {
    render(<FinishSignIn isLink={false} pending={null} complete={vi.fn()} />)
    expect(screen.getByText(/link isn.t valid/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to sign in/i })).toHaveAttribute('href', '/')
  })

  it('shows an error when completing fails', async () => {
    const complete = vi.fn().mockRejectedValue(new Error('This sign-in link has expired'))
    render(<FinishSignIn isLink pending={{ email: 'a@b.co', name: 'A' }} complete={complete} />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/expired/i)
  })
})
