'use client'

import dynamic from 'next/dynamic'

/** The link and saved email only exist in the browser, so this never renders on the server. */
export const FinishSignInLoader = dynamic(() => import('./FinishSignInClient'), {
  ssr: false,
  loading: () => (
    <p className="text-center text-base py-8" style={{ color: '#555' }}>Signing you in…</p>
  ),
})
