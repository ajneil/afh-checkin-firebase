import { FeelingIcon } from '@/components/decor'
import { QuestionStep } from '../QuestionStep'

type Props = {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}

export function ReflectStep({ value, onChange, onNext }: Props) {
  return (
    <QuestionStep
      id="reflection"
      tone="yellow"
      icon={<FeelingIcon />}
      title="How are you feeling right now?"
      hint="No right or wrong answer — just notice."
      placeholder="I'm feeling…"
      value={value}
      onChange={onChange}
      action={{ label: 'Next', onClick: onNext }}
    />
  )
}
