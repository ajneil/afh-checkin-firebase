'use client'

import { SignInForm } from '../SignInForm'
import { sendEmailLink, signInWithGoogle } from '../../utils/signIn'

export function SignInSection() {
  return <SignInForm onGoogle={signInWithGoogle} onEmailLink={sendEmailLink} />
}
