// Decorative illustrations drawn in SVG. All are aria-hidden: meaning lives in the text.

type LeafProps = { className?: string; tone?: 'green' | 'blue' | 'mixed' }

/** A sprig of two or three soft leaves, like the reference cards. */
export function Sprig({ className = '', tone = 'mixed' }: LeafProps) {
  const [a, b, c] =
    tone === 'green'
      ? ['#bfe0b0', '#a9d69a', '#cfe8c3']
      : tone === 'blue'
        ? ['#cde6f5', '#b8dcf2', '#dcecf8']
        : ['#bfe3d0', '#cde6f5', '#d9eecd']
  return (
    <svg className={`decor ${className}`} viewBox="0 0 120 140" aria-hidden="true">
      <path d="M60 138C58 96 66 58 98 24c10 40-6 80-38 114Z" fill={a} />
      <path d="M60 138C52 104 34 82 6 76c2 34 22 56 54 62Z" fill={b} />
      <path d="M62 120C70 98 88 88 112 88c-6 22-22 34-50 32Z" fill={c} opacity="0.85" />
      <path d="M60 138C62 100 74 64 94 32M60 138C48 110 30 90 14 82M62 120c14-14 30-22 46-28"
        stroke="#9ccbb3" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="40" r="5" fill="#f9d7a4" />
      <circle cx="30" cy="58" r="3.5" fill="#f6b8c6" />
      <circle cx="106" cy="14" r="4" fill="#bfe3d0" />
    </svg>
  )
}

/** Gentle rolling hills; `tone` sets the palette. */
export function Hills({ className = '', tone = 'sun' }: { className?: string; tone?: 'sun' | 'sky' }) {
  const [back, front, sun] = tone === 'sun' ? ['#f8e6a6', '#f5d97f', '#f6c47a'] : ['#dcecf5', '#cfe5ef', 'none']
  return (
    <svg className={`decor ${className}`} viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true">
      {sun !== 'none' && <circle cx="470" cy="92" r="34" fill={sun} opacity="0.7" />}
      <path d="M0 70C90 40 170 44 260 70S430 100 600 60V120H0Z" fill={back} opacity="0.8" />
      <path d="M0 96C120 70 220 78 330 96S500 112 600 90V120H0Z" fill={front} opacity="0.9" />
    </svg>
  )
}

/** Confetti dashes and twinkles around a celebration. */
export function Confetti({ className = '' }: { className?: string }) {
  return (
    <svg className={`decor ${className}`} viewBox="0 0 240 120" aria-hidden="true">
      <rect x="40" y="18" width="16" height="6" rx="3" fill="#f6b8c6" transform="rotate(35 48 21)" />
      <rect x="18" y="62" width="16" height="6" rx="3" fill="#f5d97f" transform="rotate(20 26 65)" />
      <rect x="186" y="16" width="16" height="6" rx="3" fill="#b8dcf2" transform="rotate(-35 194 19)" />
      <rect x="196" y="84" width="14" height="6" rx="3" fill="#f6b8c6" transform="rotate(50 203 87)" />
      <path d="M58 86l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#f5c542" />
      <path d="M212 44l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#f5c542" />
      <path d="M184 60l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#f5c542" />
    </svg>
  )
}

/** A soft round icon bubble used at the top of cards. */
export function IconBubble({ children, tone = 'pink' }: { children: React.ReactNode; tone?: 'pink' | 'yellow' | 'blue' | 'green' }) {
  return (
    <span className={`icon-bubble icon-bubble-${tone}`} aria-hidden="true">
      {children}
    </span>
  )
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const SunIcon = () => (
  <svg viewBox="0 0 24 24" {...stroke}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
export const HeartIcon = () => (
  <svg viewBox="0 0 24 24" {...stroke}>
    <path d="M12 20s-7-4.4-9.2-8.6C1.4 8.6 3 5 6.4 5c2 0 3.6 1.2 4.4 2.8.2.4.4.4.6 0C12.2 6.2 13.8 5 15.8 5 19.2 5 20.8 8.6 19.4 11.4 17.2 15.6 12 20 12 20Z" />
  </svg>
)
export const FeelingIcon = () => (
  <svg viewBox="0 0 24 24" {...stroke}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5c1.9 2 5.1 2 7 0M9 9.5h.01M15 9.5h.01" />
  </svg>
)
export const TargetIcon = () => (
  <svg viewBox="0 0 24 24" {...stroke}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
)
export const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" {...stroke} className="arrow-icon" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
