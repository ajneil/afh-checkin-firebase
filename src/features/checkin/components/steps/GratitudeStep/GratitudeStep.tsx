type Props = {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}

export function GratitudeStep({ value, onChange, onNext }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl p-8" style={{ background: '#BEE6F2' }}>
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#111111' }}>
          What are you grateful for today?
        </h2>
        <p className="text-sm mb-4" style={{ color: '#555' }}>
          Even the smallest things count.
        </p>
        <label htmlFor="gratitude" className="sr-only">
          What are you grateful for today?
        </label>
        <textarea
          id="gratitude"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="I'm grateful for…"
          className="w-full rounded-xl border border-blue-100 px-4 py-3 text-base outline-none resize-none focus:ring-2 focus:ring-[#E1446F]"
          style={{ background: '#FFFDF8', color: '#111111' }}
        />
      </div>
      <button
        onClick={onNext}
        className="rounded-xl px-8 py-4 text-base font-bold text-white self-end"
        style={{ background: '#E1446F' }}
      >
        Next
      </button>
    </div>
  )
}
