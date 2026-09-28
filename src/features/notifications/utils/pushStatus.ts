export type PushEnvironment = {
  configured: boolean
  supported: boolean
  appleMobile: boolean
  standalone: boolean
  permission: NotificationPermission
  enabled: boolean
}
export type PushStatus = 'hidden' | 'install' | 'unsupported' | 'blocked' | 'on' | 'off'

/** Pure decision, so every browser situation gets honest copy. */
export function pushStatus(env: PushEnvironment): PushStatus {
  if (!env.configured) return 'hidden'
  if (!env.supported) return env.appleMobile && !env.standalone ? 'install' : 'unsupported'
  if (env.permission === 'denied') return 'blocked'
  return env.permission === 'granted' && env.enabled ? 'on' : 'off'
}
