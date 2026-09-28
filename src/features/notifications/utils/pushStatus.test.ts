import { describe, expect, it } from 'vitest'
import { pushStatus, type PushEnvironment } from './pushStatus'

const base: PushEnvironment = {
  configured: true,
  supported: true,
  appleMobile: false,
  standalone: false,
  permission: 'default',
  enabled: false,
}
const status = (over: Partial<PushEnvironment>) => pushStatus({ ...base, ...over })

describe('pushStatus', () => {
  it('hides the control until a push key is configured', () => expect(status({ configured: false })).toBe('hidden'))
  it('asks iPhone users to add the app to the Home Screen first', () =>
    expect(status({ supported: false, appleMobile: true })).toBe('install'))
  it('says when a browser cannot do push', () => expect(status({ supported: false })).toBe('unsupported'))
  it('explains blocked notifications', () => expect(status({ permission: 'denied' })).toBe('blocked'))
  it('is on only with permission and a registered device', () => {
    expect(status({ permission: 'granted', enabled: true })).toBe('on')
    expect(status({ permission: 'granted', enabled: false })).toBe('off')
    expect(status({ permission: 'default', enabled: true })).toBe('off')
  })
})
