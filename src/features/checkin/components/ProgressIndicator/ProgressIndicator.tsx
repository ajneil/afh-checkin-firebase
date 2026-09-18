const STEPS = [
  { label: 'Breathe' },
  { label: 'Reflect' },
  { label: 'Gratitude' },
  { label: 'Intention' },
]

type Props = { currentStep: 1 | 2 | 3 | 4 }

export function ProgressIndicator({ currentStep }: Props) {
  return (
    <ol className="flex items-center justify-center gap-3" aria-label="Check-in progress">
      {STEPS.map((s, i) => {
        const stepNum = i + 1
        const isActive = stepNum === currentStep
        const isCompleted = stepNum < currentStep
        return (
          <li
            key={s.label}
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
            data-completed={isCompleted ? 'true' : undefined}
            className="flex flex-col items-center gap-1"
          >
            <span
              className="w-3 h-3 rounded-full block"
              style={{
                background: isActive
                  ? '#E1446F'
                  : isCompleted
                  ? '#96C85B'
                  : '#D1D5DB',
              }}
            />
            <span className="text-xs" style={{ color: isActive ? '#E1446F' : '#888' }}>
              {s.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
