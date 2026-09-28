import { TargetIcon } from '@/components/decor'
import { QuestionStep } from '../QuestionStep'

type Props = {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  submitting: boolean
}

export function IntentionStep({ value, onChange, onSubmit, submitting }: Props) {
  return (
    <QuestionStep
      id="intention"
      tone="peach"
      icon={<TargetIcon />}
      title="What one thing will you do today?"
      hint="One small, concrete intention goes a long way."
      placeholder="Today I will…"
      value={value}
      onChange={onChange}
      action={{ label: submitting ? 'Submitting…' : 'Submit', onClick: onSubmit, disabled: submitting }}
    />
  )
}
