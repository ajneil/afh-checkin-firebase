import { CheckInLoader } from '@/features/checkin/components/CheckInLoader'

type Props = {
  params: Promise<{ token: string }>
}

export default async function CheckInPage({ params }: Props) {
  const { token } = await params

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: '#FFFDF8' }}
    >
      <div className="w-full max-w-lg">
        <CheckInLoader token={token} />
      </div>
    </main>
  )
}
