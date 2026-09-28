import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeFirestore } from '@/test/fakeFirestore'

let fake: ReturnType<typeof fakeFirestore>
vi.mock('@/lib/db/firestore', () => ({
  devicesCollection: (email: string) => fake.db.collection(`users/${email}/devices`),
}))
const { deviceId, listDevices, removeDevice, saveDevice } = await import('./devices')

describe('push devices', () => {
  beforeEach(() => {
    fake = fakeFirestore()
  })

  it('stores a device under a hash of its token, not the raw token', async () => {
    await saveDevice('alex@example.com', 'fcm-token-1')
    const id = deviceId('fcm-token-1')
    expect(id).toMatch(/^[a-f0-9]{64}$/)
    expect(fake.store.get(`users/alex@example.com/devices/${id}`)).toMatchObject({ token: 'fcm-token-1' })
  })

  it('saving the same token twice keeps one device', async () => {
    await saveDevice('alex@example.com', 'fcm-token-1')
    await saveDevice('alex@example.com', 'fcm-token-1')
    expect(await listDevices('alex@example.com')).toEqual(['fcm-token-1'])
  })

  it('removes a device by token', async () => {
    await saveDevice('alex@example.com', 'a')
    await saveDevice('alex@example.com', 'b')
    await removeDevice('alex@example.com', 'a')
    expect(await listDevices('alex@example.com')).toEqual(['b'])
  })
})
