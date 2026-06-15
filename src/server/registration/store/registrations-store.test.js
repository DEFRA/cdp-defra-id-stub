import {
  BatchWriteCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb'
import { keys } from '#server/registration/store/key-builders.js'
import { DynamoDbRegistrationsStore } from '#server/registration/store/registrations-store.js'
import { registrationExpiresAt } from '#server/registration/store/ttl.js'

const tableName = 'cdp-defra-id-stub-registrations'

function itemKey(pk, sk) {
  return `${pk}|${sk}`
}

function createMockDynamoDbClient() {
  const table = new Map()

  async function send(command) {
    if (command instanceof GetCommand) {
      const { Key } = command.input
      const item = table.get(itemKey(Key.pk, Key.sk))
      return { Item: item ? { ...item } : undefined }
    }

    if (command instanceof PutCommand) {
      const { Item } = command.input
      table.set(itemKey(Item.pk, Item.sk), { ...Item })
      return {}
    }

    if (command instanceof DeleteCommand) {
      const { Key } = command.input
      table.delete(itemKey(Key.pk, Key.sk))
      return {}
    }

    if (command instanceof QueryCommand) {
      const { KeyConditionExpression, ExpressionAttributeValues } =
        command.input
      const pk = ExpressionAttributeValues[':pk']
      const skPrefix = ExpressionAttributeValues[':skPrefix']

      const items = Array.from(table.values()).filter((item) => {
        if (item.pk !== pk) {
          return false
        }

        if (KeyConditionExpression.includes('begins_with')) {
          return item.sk.startsWith(skPrefix)
        }

        return true
      })

      return { Items: items.map((item) => ({ ...item })) }
    }

    if (command instanceof BatchWriteCommand) {
      const batch = command.input.RequestItems[tableName] ?? []

      for (const request of batch) {
        const { Key } = request.DeleteRequest
        table.delete(itemKey(Key.pk, Key.sk))
      }

      return {}
    }

    throw new Error(`Unexpected command: ${command.constructor.name}`)
  }

  return {
    send,
    table
  }
}

function createStore(options = {}) {
  const client = options.client ?? createMockDynamoDbClient()

  return {
    store: new DynamoDbRegistrationsStore({
      client,
      tableName,
      ttlMs: options.ttlMs
    }),
    client
  }
}

describe('DynamoDbRegistrationsStore', () => {
  test('stores and retrieves a registration', async () => {
    const { store } = createStore()
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

  test('writes profile, index, and email lookup items on put', async () => {
    const { store, client } = createStore()
    const registration = {
      userId: 'user-1',
      email: 'person@example.com',
      firstName: 'Test'
    }

    await store.putRegistration('user-1', registration)

    expect(
      client.table.get(itemKey(keys.userPk('user-1'), keys.profileSk))?.itemType
    ).toBe('PROFILE')
    expect(
      client.table.get(
        itemKey(keys.registrationIndexPk, keys.registrationIndexSk('user-1'))
      )?.itemType
    ).toBe('REG_INDEX')
    expect(
      client.table.get(
        itemKey(
          keys.emailPk('person@example.com'),
          keys.emailLookupSk('user-1')
        )
      )?.itemType
    ).toBe('EMAIL_LOOKUP')
  })

  test('finds registration by email case-insensitively', async () => {
    const { store } = createStore()
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
      const { store } = createStore({ ttlMs: 1000 })
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

  test('removes stale email lookup when email changes', async () => {
    const { store, client } = createStore()
    await store.putRegistration('user-1', {
      userId: 'user-1',
      email: 'old@example.com'
    })

    await store.putRegistration('user-1', {
      userId: 'user-1',
      email: 'new@example.com'
    })

    expect(
      client.table.has(
        itemKey(keys.emailPk('old@example.com'), keys.emailLookupSk('user-1'))
      )
    ).toBe(false)
    expect(
      client.table.has(
        itemKey(keys.emailPk('new@example.com'), keys.emailLookupSk('user-1'))
      )
    ).toBe(true)
    await expect(
      store.findRegistrationByEmail('old@example.com')
    ).resolves.toBeUndefined()
    await expect(
      store.findRegistrationByEmail('new@example.com')
    ).resolves.toEqual({
      userId: 'user-1',
      email: 'new@example.com'
    })
  })

  test('stores and lists relationships per user', async () => {
    const { store } = createStore()
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
    const { store } = createStore()
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

  test('serializes created dates when persisting', async () => {
    const { store } = createStore()
    const created = new Date('2024-06-01T12:00:00.000Z')

    await store.putRegistration('user-1', {
      userId: 'user-1',
      email: 'person@example.com',
      created
    })

    await expect(store.getRegistration('user-1')).resolves.toEqual({
      userId: 'user-1',
      email: 'person@example.com',
      created: '2024-06-01T12:00:00.000Z'
    })
  })

  test('batch deletes in chunks of 25', async () => {
    const client = createMockDynamoDbClient()
    const sendSpy = vi.spyOn(client, 'send')
    const { store } = createStore({ client })

    await store.putRegistration('user-1', {
      userId: 'user-1',
      email: 'person@example.com'
    })

    for (let index = 0; index < 26; index += 1) {
      await store.putRelationship('user-1', `rel-${index}`, {
        userId: 'user-1',
        relationshipId: `rel-${index}`,
        organisationName: `Org ${index}`
      })
    }

    sendSpy.mockClear()
    await store.deleteAllRelationships('user-1')

    const batchWrites = sendSpy.mock.calls
      .map(([command]) => command)
      .filter((command) => command instanceof BatchWriteCommand)

    expect(batchWrites).toHaveLength(2)
    expect(batchWrites[0].input.RequestItems[tableName]).toHaveLength(25)
    expect(batchWrites[1].input.RequestItems[tableName]).toHaveLength(1)
  })

  test('reuses profile expiry when putting a relationship', async () => {
    const { store, client } = createStore({ ttlMs: 5000 })
    const profileExpiresAt = registrationExpiresAt(5000)

    client.table.set(itemKey(keys.userPk('user-1'), keys.profileSk), {
      pk: keys.userPk('user-1'),
      sk: keys.profileSk,
      itemType: 'PROFILE',
      expiresAt: profileExpiresAt,
      userId: 'user-1',
      email: 'person@example.com'
    })

    await store.putRelationship('user-1', 'rel-1', {
      userId: 'user-1',
      relationshipId: 'rel-1',
      organisationName: 'Org 1'
    })

    expect(
      client.table.get(
        itemKey(keys.userPk('user-1'), keys.relationshipSk('rel-1'))
      )?.expiresAt
    ).toBe(profileExpiresAt)
  })
})
