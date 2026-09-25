import { beforeEach, describe, expect, it, vi } from 'vitest'

const create = vi.fn()
vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {}
  class RateLimitError extends APIError {}
  class AuthenticationError extends APIError {}
  class Anthropic {
    static APIError = APIError
    static RateLimitError = RateLimitError
    static AuthenticationError = AuthenticationError
    beta = { messages: { create } }
  }
  return { default: Anthropic }
})

const recent = [
  { day: '2026-09-24', reflection: 'Tired but okay', gratitude: 'My sister', intention: 'Walk at lunch' },
]

async function load() {
  vi.resetModules()
  return import('./morningPrompt')
}

const reply = (text: string, stop_reason = 'end_turn') => ({
  stop_reason,
  content: [{ type: 'text', text }],
})

describe('morningPrompt', () => {
  beforeEach(() => {
    create.mockReset()
    process.env.ANTHROPIC_API_KEY = 'test-key'
  })

  it('uses a hand-written prompt when no API key is configured', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const { morningPrompt, FALLBACK_PROMPTS } = await load()
    expect(FALLBACK_PROMPTS).toContain(await morningPrompt('Alex', recent, '2026-09-25'))
    expect(create).not.toHaveBeenCalled()
  })

  it('returns Claude’s text, trimmed and unquoted', async () => {
    create.mockResolvedValue(reply('  "Morning Alex. What might make lunch feel restful today?"  '))
    const { morningPrompt } = await load()
    expect(await morningPrompt('Alex', recent, '2026-09-25')).toBe(
      'Morning Alex. What might make lunch feel restful today?'
    )
  })

  it('asks a current model at low effort with server-side refusal fallback', async () => {
    create.mockResolvedValue(reply('Hello'))
    const { morningPrompt } = await load()
    await morningPrompt('Alex', recent, '2026-09-25')
    const [params] = create.mock.calls[0]
    expect(params).toMatchObject({
      model: 'claude-opus-5',
      fallbacks: 'default',
      betas: ['server-side-fallback-2026-07-01'],
      output_config: { effort: 'low' },
    })
  })

  it('passes recent answers as data, not instructions', async () => {
    create.mockResolvedValue(reply('Hello'))
    const { morningPrompt } = await load()
    await morningPrompt('Alex', recent, '2026-09-25')
    const [params] = create.mock.calls[0]
    const content = params.messages[0].content as string
    expect(content).toContain('<recent_check_ins>')
    expect(content).toContain('Walk at lunch')
    expect(params.system).toMatch(/data/i)
  })

  it('falls back when the model refuses', async () => {
    create.mockResolvedValue(reply('', 'refusal'))
    const { morningPrompt, FALLBACK_PROMPTS } = await load()
    expect(FALLBACK_PROMPTS).toContain(await morningPrompt('Alex', recent, '2026-09-25'))
  })

  it('falls back when the API errors', async () => {
    create.mockRejectedValue(new Error('network down'))
    const { morningPrompt, FALLBACK_PROMPTS } = await load()
    expect(FALLBACK_PROMPTS).toContain(await morningPrompt('Alex', recent, '2026-09-25'))
  })

  it('falls back when the reply is too long to be a morning prompt', async () => {
    create.mockResolvedValue(reply('x'.repeat(600)))
    const { morningPrompt, FALLBACK_PROMPTS } = await load()
    expect(FALLBACK_PROMPTS).toContain(await morningPrompt('Alex', recent, '2026-09-25'))
  })

  it('picks the same hand-written prompt for the same day', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const { morningPrompt } = await load()
    expect(await morningPrompt('Alex', [], '2026-09-25')).toBe(
      await morningPrompt('Sam', [], '2026-09-25')
    )
  })
})
