import { IconBubble, Sprig, SunIcon } from '@/components/decor'
import { splitGreeting } from '@/lib/text/splitGreeting'

/** Today's morning prompt, with any opening greeting lifted into a heading. */
export function PromptCard({ prompt }: { prompt: string }) {
  const { greeting, body } = splitGreeting(prompt)
  return (
    <section className="soft-card flex items-start gap-4 p-6 pr-24 sm:p-7 sm:pr-32" aria-label="This morning">
      <IconBubble tone="pink">
        <SunIcon />
      </IconBubble>
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#E1446F' }}>
          This morning
        </p>
        {greeting && (
          <p className="text-xl sm:text-2xl font-bold mt-1" style={{ color: '#14213d' }}>
            {greeting}
          </p>
        )}
        <p className="text-base sm:text-lg leading-relaxed mt-1" style={{ color: greeting ? '#5b6470' : '#14213d' }}>
          {body}
        </p>
      </div>
      <Sprig className="absolute right-1 -bottom-2 w-24 sm:w-28" tone="mixed" />
    </section>
  )
}
