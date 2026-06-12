import { MemoryRegistrationsStore } from '#server/registration/store/memory-store.js'

describe('MemoryRegistrationsStore', () => {
  test('stores and retrieves a registration', async () => {
    const store = new MemoryRegistrationsStore()
    const registration = {
      userId: 'user-1',
      email: 'person@example.com',
      firstName: 'Test'
    }

    await store.putRegistration('user-1', registration)

    await expect(store.getRegistration('user-1')).resolves.toEqual(registration)
    await expect(store.listRegistrations()).resolves.toEqual([
      { userId: 'user-1', email: 'person@example.com' }
    ])
  })

  test('finds registration by email case-insensitively', async () => {
    const store = new MemoryRegistrationsStore()
    const registration = {
      userId: 'user-1',
      email: 'person@example.com'
    }
    await store.putRegistration('user-1', registration)

    await expect(
      store.findRegistrationByEmail('PERSON@example.com')
    ).resolves.toEqual(registration)
  })

  test('expires registrations using ttl', async () => {
    vi.useFakeTimers()

    try {
      const store = new MemoryRegistrationsStore({ ttlMs: 1000 })
      const registration = {
        userId: 'user-1',
        email: 'person@example.com'
      }

      await store.putRegistration('user-1', registration)

      await expect(store.getRegistration('user-1')).resolves.toEqual(
        registration
      )
      await expect(store.listRegistrations()).resolves.toEqual([
        { userId: 'user-1', email: 'person@example.com' }
      ])

      vi.advanceTimersByTime(1001)

      await expect(store.getRegistration('user-1')).resolves.toBeUndefined()
      await expect(store.listRegistrations()).resolves.toEqual([])
      await expect(
        store.findRegistrationByEmail('person@example.com')
      ).resolves.toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })

  test('stores and lists relationships per user', async () => {
    const store = new MemoryRegistrationsStore()
    const relationship = {
      userId: 'user-1',
      relationshipId: 'rel-1',
      organisationName: 'Org 1'
    }
    await store.putRelationship('user-1', 'rel-1', relationship)

    await expect(store.getRelationship('user-1', 'rel-1')).resolves.toEqual(
      relationship
    )
    await expect(store.listRelationships('user-1')).resolves.toEqual([
      relationship
    ])
  })

  test('deletes registration and cascades relationships', async () => {
    const store = new MemoryRegistrationsStore()
    const registration = {
      userId: 'user-1',
      email: 'person@example.com'
    }
    const relationship = {
      userId: 'user-1',
      relationshipId: 'rel-1',
      organisationName: 'Org 1'
    }
    await store.putRegistration('user-1', registration)
    await store.putRelationship('user-1', 'rel-1', relationship)

    await store.deleteRegistration('user-1')

    await expect(store.getRegistration('user-1')).resolves.toBeUndefined()
    await expect(
      store.findRegistrationByEmail('person@example.com')
    ).resolves.toBeUndefined()
    await expect(store.listRelationships('user-1')).resolves.toEqual([])
  })
})
