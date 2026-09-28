import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PushToggleView } from './PushToggle'

describe('PushToggleView', () => {
  it('renders nothing when push is not configured', () => {
    const { container } = render(<PushToggleView status="hidden" busy={false} error="" onToggle={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('offers to turn morning notifications on', async () => {
    const onToggle = vi.fn()
    render(<PushToggleView status="off" busy={false} error="" onToggle={onToggle} />)
    await userEvent.setup().click(screen.getByRole('button', { name: /turn on notifications/i }))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('shows when they are on and lets them turn off', () => {
    render(<PushToggleView status="on" busy={false} error="" onToggle={vi.fn()} />)
    expect(screen.getByText(/on for this device/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /turn off notifications/i })).toBeInTheDocument()
  })

  it('explains the iPhone Home Screen step instead of a button', () => {
    render(<PushToggleView status="install" busy={false} error="" onToggle={vi.fn()} />)
    expect(screen.getByText(/add to home screen/i)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('explains blocked notifications', () => {
    render(<PushToggleView status="blocked" busy={false} error="" onToggle={vi.fn()} />)
    expect(screen.getByText(/blocked/i)).toBeInTheDocument()
  })

  it('shows errors', () => {
    render(<PushToggleView status="off" busy={false} error="Couldn’t turn them on." onToggle={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t turn them on.')
  })
})
