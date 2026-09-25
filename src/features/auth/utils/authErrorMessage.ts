/** Friendly copy for Firebase Auth errors; null means "say nothing" (e.g. popup closed). */
export function authErrorMessage(error: unknown): string | null {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null
    case 'auth/invalid-email':
    case 'auth/missing-email':
      return 'Please enter a valid email address.'
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google pop-up. Allow pop-ups for this site and try again.'
    case 'auth/unauthorized-domain':
      return 'Sign-in isn’t set up for this site yet. Please try again later.'
    case 'auth/operation-not-allowed':
      return 'This sign-in option isn’t switched on yet. Please try the other option.'
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'This sign-in link has expired or has already been used. Please request a new one.'
    case 'auth/account-exists-with-different-credential':
      return 'You’ve signed in with this email before using the other sign-in option. Please use that instead.'
    case 'auth/network-request-failed':
      return 'We couldn’t reach the sign-in service. Check your connection and try again.'
    default:
      return 'Something went wrong signing you in. Please try again.'
  }
}
