import { FinishSignInLoader } from '@/features/auth'

export default function FinishSignInPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: '#FFFDF8' }}
    >
      <div className="w-full max-w-lg">
        <FinishSignInLoader />
      </div>
    </main>
  )
}
