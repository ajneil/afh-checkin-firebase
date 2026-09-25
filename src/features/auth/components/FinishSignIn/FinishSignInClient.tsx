'use client'

import { useState } from 'react'
import { FinishSignIn } from './FinishSignIn'
import { finishEmailLink, isEmailLink, pendingSignIn } from '../../utils/signIn'

export default function FinishSignInClient() {
  const [state] = useState(() => ({ isLink: isEmailLink(), pending: pendingSignIn() }))
  return <FinishSignIn {...state} complete={finishEmailLink} />
}
