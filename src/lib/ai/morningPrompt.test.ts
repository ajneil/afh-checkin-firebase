import { beforeEach, describe, expect, it, vi } from 'vitest'

const generateContent = vi.fn()
const constructed = vi.fn()
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent }
    constructor(options: unknown) {
      constructed(options)
    }
  },
  ThinkingLevel: { LOW: 'LOW' },
  FinishReason: { STOP: 'STOP' },
}))

const recent = [
  { day: '2026-09-24', reflection: 'Tired but okay', gratitude: 'My sister', intention: 'Walk at lunch' },
]

async function load() {
  vi.resetModules()
  return import('./morningPrompt')
}

const reply = (text: string, finishReason = 'STOP') => ({ text, candidates: [{ finishReason }] })

describe('morningPrompt', () => {
  beforeEach(() => {
    generateContent.mockReset()
    constructed.mockReset()
    process.env.GOOGLE_CLOUD_PROJECT = 'fir-wellness-f833d'
    delete process.env.GOOGLE_CLOUD_LOCATION
    delete process.env.GEMINI_MODEL
  })

  it('uses a hand-written prompt when no Google Cloud project is configured', async () => {
    delete process.env.GOOGLE_CLOUD_PROJECT
    const { morningPrompt, FALLBACK_PROMPTS } = await load()
    expect(FALLBACK_PROMPTS).toContain(await morningPrompt('Alex', recent, '2026-09-25'))
    expect(generateContent).not.toHaveBeenCalled()
  })

  it('returns Gemini’s text, trimmed and unquoted', async () => {
    generateContent.mockResolvedValue(reply('  "Morning Alex. What might make lunch feel restful today?"  '))
    const { morningPrompt } = await load()
    expect(await morningPrompt('Alex', recent, '2026-09-25')).toBe(
      'Morning Alex. What might make lunch feel restful today?'
    )
  })

  it('calls Gemini 3.6 Flash on Vertex AI with the project’s own credentials and low thinking', async () => {
    generateContent.mockResolvedValue(reply('Hello'))
    const { morningPrompt } = await load()
    await morningPrompt('Alex', recent, '2026-09-25')
    expect(constructed).toHaveBeenCalledWith(
      expect.objectContaining({ vertexai: true, project: 'fir-wellness-f833d', location: 'global' })
    )
    expect(constructed.mock.calls[0][0]).not.toHaveProperty('apiKey')
    const [params] = generateContent.mock.calls[0]
    expect(params.model).toBe('gemini-3.6-flash')
    expect(params.config.thinkingConfig).toEqual({ thinkingLevel: 'LOW' })
  })

  it('lets the model and region be overridden', async () => {
    process.env.GEMINI_MODEL = 'gemini-3.8-flash'
    process.env.GOOGLE_CLOUD_LOCATION = 'europe-west2'
    generateContent.mockResolvedValue(reply('Hello'))
    const { morningPrompt } = await load()
    await morningPrompt('Alex', recent, '2026-09-25')
    expect(constructed).toHaveBeenCalledWith(expect.objectContaining({ location: 'europe-west2' }))
    expect(generateContent.mock.calls[0][0].model).toBe('gemini-3.8-flash')
  })

  it('passes recent answers as data, not instructions', async () => {
    generateContent.mockResolvedValue(reply('Hello'))
    const { morningPrompt } = await load()
    await morningPrompt('Alex', recent, '2026-09-25')
    const [params] = generateContent.mock.calls[0]
    expect(params.contents).toContain('<recent_check_ins>')
    expect(params.contents).toContain('Walk at lunch')
    expect(params.config.systemInstruction).toMatch(/data/i)
  })

  it('falls back when the response is blocked or cut short', async () => {
    generateContent.mockResolvedValue(reply('', 'SAFETY'))
    const { morningPrompt, FALLBACK_PROMPTS } = await load()
    expect(FALLBACK_PROMPTS).toContain(await morningPrompt('Alex', recent, '2026-09-25'))
    generateContent.mockResolvedValue(reply('Half a sent', 'MAX_TOKENS'))
    expect(FALLBACK_PROMPTS).toContain(await morningPrompt('Alex', recent, '2026-09-25'))
  })

  it('falls back when the API errors', async () => {
    generateContent.mockRejectedValue(new Error('PERMISSION_DENIED'))
    const { morningPrompt, FALLBACK_PROMPTS } = await load()
    expect(FALLBACK_PROMPTS).toContain(await morningPrompt('Alex', recent, '2026-09-25'))
  })

  it('falls back when the reply is too long to be a morning prompt', async () => {
    generateContent.mockResolvedValue(reply('x'.repeat(600)))
    const { morningPrompt, FALLBACK_PROMPTS } = await load()
    expect(FALLBACK_PROMPTS).toContain(await morningPrompt('Alex', recent, '2026-09-25'))
  })

  it('picks the same hand-written prompt for the same day', async () => {
    delete process.env.GOOGLE_CLOUD_PROJECT
    const { morningPrompt } = await load()
    expect(await morningPrompt('Alex', [], '2026-09-25')).toBe(await morningPrompt('Sam', [], '2026-09-25'))
  })
})
