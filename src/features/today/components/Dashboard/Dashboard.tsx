import { SignOutButton } from '@/features/auth'
import { ArrowIcon, HeartIcon, IconBubble, Sprig, SunIcon, TargetIcon } from '@/components/decor'
import { splitGreeting } from '@/lib/text/splitGreeting'
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

      <section className="soft-card soft-card-blue p-7 sm:p-8 flex flex-col gap-5" aria-label="Today">
        <Sprig className="absolute -right-2 -bottom-3 w-24 sm:w-28 opacity-90" tone="mixed" />
        {today?.completed ? (
          <div className="relative flex items-start gap-4">
            <IconBubble tone="yellow">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="#f5b83a" />
              </svg>
            </IconBubble>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#14213d' }}>Done for today</p>
              <p className="text-base mt-1" style={{ color: '#5b6470' }}>
                Carry your intention with you. We&apos;ll have a fresh check-in ready tomorrow.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative flex items-start gap-4 pr-16">
              <IconBubble tone="pink">
                <SunIcon />
              </IconBubble>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#E1446F' }}>
                  This morning
                </p>
                {today?.prompt ? (
                  <TodayPrompt prompt={today.prompt} />
                ) : (
                  <p className="text-xl font-bold mt-1" style={{ color: '#14213d' }}>
                    A few quiet minutes, just for you.
                  </p>
                )}
              </div>
            </div>
            <form action={startAction} className="relative">
              <button type="submit" className="pill-button w-full sm:w-auto">
                Start today&apos;s check-in
                <ArrowIcon />
              </button>
            </form>
          </>
        )}
        <p className="relative text-sm" style={{ color: '#5b6470' }}>
          Your morning prompt is written by AI, using your last few check-ins.
        </p>
      </section>

      {history.length > 0 && (
        <section className="flex flex-col gap-4" aria-label="Recent check-ins">
          <h2 className="text-xl font-bold" style={{ color: '#14213d' }}>Recent check-ins</h2>
          <ul className="flex flex-col gap-3">
            {history.map((entry) => (
              <li key={entry.day} className="soft-card p-5 flex flex-col gap-3">
                <p className="self-start rounded-full px-3 py-1 text-sm font-semibold" style={{ background: '#fdf0c4', color: '#8a5a00' }}>
                  {formatDay(entry.day)}
                </p>
                {entry.intention && (
                  <p className="flex items-start gap-2 text-base font-semibold" style={{ color: '#14213d' }}>
                    <span className="mt-0.5 w-5 h-5 flex-none" style={{ color: '#e1446f' }}><TargetIcon /></span>
                    {entry.intention}
                  </p>
                )}
                {entry.gratitude && (
                  <p className="flex items-start gap-2 text-base" style={{ color: '#5b6470' }}>
                    <span className="mt-0.5 w-5 h-5 flex-none" style={{ color: '#3f86c9' }}><HeartIcon /></span>
                    Grateful for: {entry.gratitude}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <form action={emailsAction} className="soft-card p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <p className="text-base" style={{ color: '#5b6470' }}>
          {morningEmails
            ? 'We email your check-in each morning at around 7:30.'
            : 'Morning emails are off. You can still check in here any time.'}
        </p>
        <input type="hidden" name="enabled" value={morningEmails ? 'off' : 'on'} />
        <button type="submit" className="pill-button pill-button-quiet self-start sm:self-auto text-sm whitespace-nowrap">
          {morningEmails ? 'Turn off morning emails' : 'Turn on morning emails'}
        </button>
      </form>
    </div>
  )
}

function TodayPrompt({ prompt }: { prompt: string }) {
  const { greeting, body } = splitGreeting(prompt)
  return (
    <>
      {greeting && (
        <p className="text-xl sm:text-2xl font-bold mt-1" style={{ color: '#14213d' }}>
          {greeting}
        </p>
      )}
      <p className="text-base sm:text-lg leading-relaxed mt-1" style={{ color: greeting ? '#5b6470' : '#14213d' }}>
        {body}
      </p>
    </>
  )
}
