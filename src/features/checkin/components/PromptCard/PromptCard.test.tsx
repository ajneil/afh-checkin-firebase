import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PromptCard } from './PromptCard'

describe('PromptCard', () => {
  it('shows the greeting as a heading line above the prompt', () => {
    render(<PromptCard prompt="Good morning, Alex. How are you feeling today?" />)
    expect(screen.getByText('Good morning, Alex.')).toBeInTheDocument()
    expect(screen.getByText('How are you feeling today?')).toBeInTheDocument()
  })

  it('shows prompts without a greeting in full', () => {
    render(<PromptCard prompt="What would being kind to yourself look like today?" />)
    expect(screen.getByText('What would being kind to yourself look like today?')).toBeInTheDocument()
  })
})
