import { HeartIcon } from '@/components/decor'
import { QuestionStep } from '../QuestionStep'

type Props = {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}

export function GratitudeStep({ value, onChange, onNext }: Props) {
  return (
    <QuestionStep
      id="gratitude"
      tone="blue"
      icon={<HeartIcon />}
      title="What are you grateful for today?"
      hint="Even the smallest things count."
      placeholder="I'm grateful for…"
      value={value}
      onChange={onChange}
      action={{ label: 'Next', onClick: onNext }}
    />
  )
}
