import { describe, expect, it } from 'vitest'
import { splitGreeting } from './splitGreeting'

describe('splitGreeting', () => {
  it('lifts an opening greeting into a heading', () => {
    expect(
      splitGreeting('Good morning, Alex. How are you feeling as you start your day?')
    ).toEqual({ greeting: 'Good morning, Alex.', body: 'How are you feeling as you start your day?' })
  })

  it.each(['Morning, Sam!', 'Hi Alex,', 'Hello there.'])('recognises "%s"', (opening) => {
    expect(splitGreeting(`${opening} What would make today kind?`).greeting).toBe(opening)
  })

  it('leaves prompts without a greeting whole', () => {
    expect(splitGreeting('Take a slow breath. What could bring you joy?')).toEqual({
      greeting: null,
      body: 'Take a slow breath. What could bring you joy?',
    })
  })

  it('does not split when the greeting is the whole prompt', () => {
    expect(splitGreeting('Good morning, Alex.')).toEqual({ greeting: null, body: 'Good morning, Alex.' })
  })
})
