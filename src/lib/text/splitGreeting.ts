// A whole greeting sentence ("Good morning, Alex.") or a comma salutation ("Hi Alex,").
const SENTENCE = /^((?:good morning|morning|hi|hello|hey)\b[^.!?]*[.!?])\s+(\S[\s\S]*)$/i
const SALUTATION = /^((?:hi|hello|hey)\b[^.!?,]*,)\s+(\S[\s\S]*)$/i

/** "Good morning, Alex. How are you…" → heading "Good morning, Alex." + body. */
export function splitGreeting(prompt: string): { greeting: string | null; body: string } {
  const text = prompt.trim()
  const match = SENTENCE.exec(text) ?? SALUTATION.exec(text)
  return match ? { greeting: match[1], body: match[2] } : { greeting: null, body: text }
}
