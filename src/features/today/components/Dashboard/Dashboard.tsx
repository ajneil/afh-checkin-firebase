import { SignOutButton } from '@/features/auth'
import type { RecentAnswer } from '@/lib/ai/morningPrompt'

type Props = {
  name: string
  today: { prompt: string; completed: boolean } | null
  history: RecentAnswer[]
  morningEmails: boolean
  startAction: () => Promise<void>
  emailsAction: (formData: FormData) => Promise<void>
}

const formatDay = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

export function Dashboard({ name, today, history, morningEmails, startAction, emailsAction }: Props) {
  const firstName = name.split(' ')[0] || 'there'
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#E1446F' }}>
            Action for Happiness
          </p>
          <h1 className="text-3xl font-bold" style={{ color: '#111111' }}>
            Hi, {firstName}
          </h1>
        </div>
        <SignOutButton />
      </header>

      <section className="rounded-2xl p-8 flex flex-col gap-5" style={{ background: '#BEE6F2' }} aria-label="Today">
        {today?.completed ? (
          <>
            <p className="text-2xl font-bold" style={{ color: '#111111' }}>Done for today 🌟</p>
            <p className="text-base" style={{ color: '#333' }}>
              Carry your intention with you. We&apos;ll have a fresh check-in ready tomorrow.
            </p>
          </>
        ) : (
          <>
            {today?.prompt && (
              <p className="text-xl leading-relaxed" style={{ color: '#111111' }}>{today.prompt}</p>
            )}
            <form action={startAction}>
              <button
                type="submit"
                className="w-full rounded-xl px-6 py-4 text-base font-bold text-white"
                style={{ background: '#E1446F' }}
              >
                Start today&apos;s check-in
              </button>
            </form>
          </>
        )}
        <p className="text-sm" style={{ color: '#444' }}>
          Your morning prompt is written by AI, using your last few check-ins.
        </p>
      </section>

      {history.length > 0 && (
        <section className="flex flex-col gap-4" aria-label="Recent check-ins">
          <h2 className="text-xl font-bold" style={{ color: '#111111' }}>Recent check-ins</h2>
          <ul className="flex flex-col gap-3">
            {history.map((entry) => (
              <li key={entry.day} className="rounded-2xl p-5" style={{ background: '#F9E78B' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#555' }}>{formatDay(entry.day)}</p>
                {entry.intention && <p className="text-base font-semibold" style={{ color: '#111111' }}>{entry.intention}</p>}
                {entry.gratitude && (
                  <p className="text-base mt-1" style={{ color: '#333' }}>Grateful for: {entry.gratitude}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <form action={emailsAction} className="flex flex-col gap-2 border-t border-gray-200 pt-6">
        <p className="text-base" style={{ color: '#333' }}>
          {morningEmails
            ? 'We email your check-in each morning at around 7:30.'
            : 'Morning emails are off. You can still check in here any time.'}
        </p>
        <input type="hidden" name="enabled" value={morningEmails ? 'off' : 'on'} />
        <button type="submit" className="self-start text-sm font-semibold underline" style={{ color: '#E1446F' }}>
          {morningEmails ? 'Turn off morning emails' : 'Turn on morning emails'}
        </button>
      </form>
    </div>
  )
}
