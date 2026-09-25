import { SignInSection } from '@/features/auth'
import { Dashboard } from '@/features/today'
import { getCurrentUser } from '@/lib/auth/currentUser'
import { findCheckIn, recentCheckIns } from '@/lib/checkins/daily'
import { localTime } from '@/lib/time/localTime'
import { setMorningEmails, startTodaysCheckIn } from './actions'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: '#FFFDF8' }}
    >
      <div className="w-full max-w-lg">
        {user ? await signedIn(user) : <SignedOut />}
      </div>
    </main>
  )
}

async function signedIn(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  const { day } = localTime(new Date(), user.timeZone)
  const [today, history] = await Promise.all([findCheckIn(user.email, day), recentCheckIns(user.email, 7)])
  return (
    <Dashboard
      name={user.name}
      today={today && { prompt: today.prompt, completed: today.completed }}
      history={history}
      morningEmails={user.morningEmails}
      startAction={startTodaysCheckIn}
      emailsAction={setMorningEmails}
    />
  )
}

function SignedOut() {
  return (
    <>
      <header className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#E1446F' }}>
          Action for Happiness
        </p>
        <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: '#111111' }}>
          Your Daily Check-In
        </h1>
        <p className="text-base leading-relaxed" style={{ color: '#555' }}>
          Each morning you&apos;ll get a gentle email with a short guided check-in: breathe, reflect on
          how you&apos;re feeling, notice what you&apos;re grateful for, and set one small intention. It
          takes just a few minutes.
        </p>
      </header>

      <div className="rounded-2xl p-8" style={{ background: '#BEE6F2' }}>
        <SignInSection />
      </div>

      <p className="mt-6 text-center text-sm" style={{ color: '#888' }}>
        Free to join. No passwords. Turn emails off any time.
      </p>
    </>
  )
}
