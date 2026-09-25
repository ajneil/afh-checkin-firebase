import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'

vi.mock('@/features/auth', () => ({ SignOutButton: () => <button>Sign out</button> }))

const base = {
  name: 'Alex Smith',
  today: null,
  history: [],
  morningEmails: true,
  startAction: vi.fn(),
  emailsAction: vi.fn(),
}

describe('Dashboard', () => {
  it('greets the person by first name', () => {
    render(<Dashboard {...base} />)
    expect(screen.getByRole('heading', { name: /hi, alex/i })).toBeInTheDocument()
  })

  it('offers to start today’s check-in when there is none yet', () => {
    render(<Dashboard {...base} />)
    expect(screen.getByRole('button', { name: /start today.s check-in/i })).toBeInTheDocument()
  })

  it('shows today’s prompt and lets the person continue', () => {
    render(<Dashboard {...base} today={{ prompt: 'What would make today kind?', completed: false }} />)
    expect(screen.getByText('What would make today kind?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start today.s check-in/i })).toBeInTheDocument()
  })

  it('celebrates a finished check-in instead of offering another', () => {
    render(<Dashboard {...base} today={{ prompt: 'Q', completed: true }} />)
    expect(screen.getByText(/done for today/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /start today.s check-in/i })).not.toBeInTheDocument()
  })

  it('lists recent check-ins', () => {
    render(
      <Dashboard
        {...base}
        history={[{ day: '2026-09-24', reflection: 'Calm', gratitude: 'Tea', intention: 'Call Mum' }]}
      />
    )
    expect(screen.getByText('Call Mum')).toBeInTheDocument()
    expect(screen.getByText(/24 september/i)).toBeInTheDocument()
  })

  it('lets the person turn morning emails off, and back on', () => {
    const { rerender } = render(<Dashboard {...base} />)
    expect(screen.getByRole('button', { name: /turn off morning emails/i })).toBeInTheDocument()
    rerender(<Dashboard {...base} morningEmails={false} />)
    expect(screen.getByRole('button', { name: /turn on morning emails/i })).toBeInTheDocument()
  })

  it('says the prompt is written with AI from recent answers', () => {
    render(<Dashboard {...base} />)
    expect(screen.getByText(/written by ai/i)).toBeInTheDocument()
  })
})
