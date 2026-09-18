// Deliberately simple — good enough to reject obvious garbage without the false-negative
// footguns of a "strict" RFC 5322 regex. Real validation is the confirmation email landing.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email)
}
