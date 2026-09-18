type Props = {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  submitting: boolean
}

export function IntentionStep({ value, onChange, onSubmit, submitting }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl p-8" style={{ background: '#F9E78B' }}>
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#111111' }}>
          What one thing will you do today?
        </h2>
        <p className="text-sm mb-4" style={{ color: '#555' }}>
          One small, concrete intention goes a long way.
        </p>
        <label htmlFor="intention" className="sr-only">
          What one thing will you do today?
        </label>
        <textarea
          id="intention"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Today I will…"
          className="w-full rounded-xl border border-yellow-200 px-4 py-3 text-base outline-none resize-none focus:ring-2 focus:ring-[#E1446F]"
          style={{ background: '#FFFDF8', color: '#111111' }}
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="rounded-xl px-8 py-4 text-base font-bold text-white self-end disabled:opacity-50"
        style={{ background: '#E1446F' }}
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </div>
  )
}
