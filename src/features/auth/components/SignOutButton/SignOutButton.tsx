'use client'

import { useState } from 'react'
import { signOutEverywhere } from '../../utils/signIn'

export function SignOutButton() {
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true)
        void signOutEverywhere().catch(() => setBusy(false))
      }}
      className="text-sm underline disabled:opacity-50"
      style={{ color: '#555' }}
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
