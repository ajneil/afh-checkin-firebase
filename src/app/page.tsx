import { SignupSection } from '@/features/signup'

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: '#FFFDF8' }}
    >
      <div className="w-full max-w-lg">
        <header className="mb-10 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: '#E1446F' }}
          >
            Action for Happiness
          </p>
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: '#111111' }}>
            Your Daily Check-In
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#555' }}>
            Sign up and each day you&apos;ll receive a gentle email with a link to a short
            guided experience — breathe, reflect on how you&apos;re feeling, notice what
            you&apos;re grateful for, and set one small intention. It takes just a few minutes.
          </p>
        </header>

        <div className="rounded-2xl p-8" style={{ background: '#BEE6F2' }}>
          <SignupSection />
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: '#888' }}>
          Free to join. No passwords. Unsubscribe any time.
        </p>
      </div>
    </main>
  )
}
