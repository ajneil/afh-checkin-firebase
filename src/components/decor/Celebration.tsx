import Link from 'next/link'
import { ArrowIcon, Confetti, Hills, Sprig } from './Decor'

type Props = {
  title: string
  children: React.ReactNode
  cta?: { href: string; label: string }
  /** Use 1 when the celebration is the page's main heading. */
  level?: 1 | 2
}

/** The warm "you did it" card: star in a glow, confetti, sprigs and sunny hills. */
export function Celebration({ title, children, cta, level = 2 }: Props) {
  const Heading = level === 1 ? 'h1' : 'h2'
  return (
    <div className="flex flex-col items-center gap-7 animate-fade-in">
      <div className="soft-card soft-card-yellow w-full px-6 pt-10 pb-28 text-center">
        <div className="relative mx-auto w-60 h-28 grid place-items-center">
          <Confetti className="absolute inset-0 w-full h-full" />
          <span className="star-glow" role="img" aria-label="Star">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <defs>
                <linearGradient id="star-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffd966" />
                  <stop offset="1" stopColor="#f5a623" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"
                fill="url(#star-fill)"
                stroke="#f0a020"
                strokeWidth="0.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <Heading className="text-3xl sm:text-4xl font-bold mt-4" style={{ color: '#14213d' }}>
          {title}
        </Heading>
        <p className="text-base sm:text-lg leading-relaxed max-w-md mx-auto mt-3" style={{ color: '#5b6470' }}>
          {children}
        </p>
        <Sprig className="absolute left-2 bottom-4 w-20 sm:w-24" tone="green" />
        <Sprig className="absolute right-2 bottom-6 w-16 sm:w-20 -scale-x-100" tone="green" />
        <Hills className="absolute inset-x-0 bottom-0 w-full h-20" tone="sun" />
      </div>
      {cta && (
        <Link href={cta.href} className="pill-button">
          {cta.label}
          <ArrowIcon />
        </Link>
      )}
    </div>
  )
}
