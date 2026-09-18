import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckInFlow } from './CheckInFlow'

global.fetch = vi.fn()

describe('CheckInFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  it('renders step 1 (Breathe) by default', () => {
    render(<CheckInFlow token="tok-abc" />)
    expect(screen.getByRole('heading', { name: /breath/i })).toBeInTheDocument()
  })

  it('"I\'m ready" button advances to step 2 (Reflect)', async () => {
    const user = userEvent.setup()
    render(<CheckInFlow token="tok-abc" />)
    await user.click(screen.getByRole('button', { name: /i'm ready/i }))
    expect(screen.getByRole('heading', { name: /how are you feeling/i })).toBeInTheDocument()
  })

  it('step 2 renders a reflection textarea', async () => {
    const user = userEvent.setup()
    render(<CheckInFlow token="tok-abc" />)
    await user.click(screen.getByRole('button', { name: /i'm ready/i }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('step 3 renders a gratitude textarea', async () => {
    const user = userEvent.setup()
    render(<CheckInFlow token="tok-abc" />)
    await user.click(screen.getByRole('button', { name: /i'm ready/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('heading', { name: /grateful/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('step 4 renders an intention textarea and a Submit button', async () => {
    const user = userEvent.setup()
    render(<CheckInFlow token="tok-abc" />)
    await user.click(screen.getByRole('button', { name: /i'm ready/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('heading', { name: /one thing/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('submit calls fetch and shows completion state', async () => {
    const user = userEvent.setup()
    render(<CheckInFlow token="tok-abc" />)
    await user.click(screen.getByRole('button', { name: /i'm ready/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(screen.getByText(/well done/i)).toBeInTheDocument()
    })
  })
})
