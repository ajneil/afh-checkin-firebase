import type { ReactNode } from 'react'
import { ArrowIcon, IconBubble, Sprig } from '@/components/decor'

type Tone = 'yellow' | 'blue' | 'peach'

type Props = {
  id: string
  tone: Tone
  icon: ReactNode
  title: string
  hint: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  action: { label: string; onClick: () => void; disabled?: boolean }
}

const BUBBLE = { yellow: 'yellow', blue: 'blue', peach: 'pink' } as const

/** Shared look for the Reflect, Gratitude and Intention steps. */
export function QuestionStep({ id, tone, icon, title, hint, placeholder, value, onChange, action }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className={`soft-card soft-card-${tone} p-7 pb-16 sm:p-9 sm:pb-16`}>
        <Sprig className="absolute -right-2 -bottom-4 w-20 opacity-80" tone={tone === 'blue' ? 'blue' : 'green'} />
        <div className="relative flex items-start gap-4 mb-5">
          <IconBubble tone={BUBBLE[tone]}>{icon}</IconBubble>
          <div>
            <h2 className="text-2xl font-bold leading-tight" style={{ color: '#111111' }}>
              {title}
            </h2>
            <p className="text-base mt-1" style={{ color: '#5b6470' }}>
              {hint}
            </p>
          </div>
        </div>
        <label htmlFor={id} className="sr-only">
          {title}
        </label>
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="soft-input relative"
        />
      </div>
      <button onClick={action.onClick} disabled={action.disabled} className="pill-button self-center sm:self-end">
        {action.label}
        <ArrowIcon />
      </button>
    </div>
  )
}
