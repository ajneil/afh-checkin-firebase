type Props = { onNext: () => void }

export function BreatheStep({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center text-center gap-8">
      <div className="rounded-2xl p-8 w-full" style={{ background: '#BEE6F2' }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#111111' }}>
          Let&apos;s start with a breath
        </h2>
        <p className="text-base mb-8" style={{ color: '#444' }}>
          Before we begin, take one slow, deep breath.
        </p>

        <div className="flex items-center justify-center mb-8" style={{ height: '120px' }}>
          <div
            className="animate-breathe rounded-full"
            style={{
              width: '80px',
              height: '80px',
              background: 'radial-gradient(circle, #8FD3E8 0%, #BEE6F2 100%)',
            }}
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-base font-medium" style={{ color: '#E1446F' }}>Breathe in… 2… 3… 4…</p>
          <p className="text-base font-medium" style={{ color: '#555' }}>Hold… 2… 3… 4…</p>
          <p className="text-base font-medium" style={{ color: '#96C85B' }}>Breathe out… 2… 3… 4…</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="rounded-xl px-8 py-4 text-base font-bold text-white"
        style={{ background: '#E1446F' }}
      >
        I&apos;m ready
      </button>
    </div>
  )
}
