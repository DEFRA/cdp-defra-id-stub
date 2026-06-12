import {
  BatchWriteCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb'
import {
  keys,
  normalizeEmail
} from '#server/registration/store/key-builders.js'
import {
  defaultRegistrationTtlMs,
  isExpired,
  registrationExpiresAt
} from '#server/registration/store/ttl.js'

function asPersisted(record) {
  return {
    ...record,
    created:
      record?.created instanceof Date
        ? record.created.toISOString()
        : record?.created
  }
}

function withoutKeys(item) {
  if (!item) {
    return undefined
  }

  const { pk, sk, itemType, expiresAt, ...record } = item
  return record
}

class DynamoDbRegistrationsStore {
  constructor(options) {
    this.client = options.client
    this.tableName = options.tableName
    this.ttlMs = options.ttlMs ?? defaultRegistrationTtlMs
  }

  async getRegistration(userId) {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: keys.userPk(userId),
          sk: keys.profileSk
        }
      })
    )

    if (isExpired(result.Item?.expiresAt)) {
      return undefined
    }

    return withoutKeys(result.Item)
  }

  async listRegistrations() {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': keys.registrationIndexPk,
          ':skPrefix': 'REG#'
        }
      })
    )

    return (result.Items ?? [])
      .filter((item) => !isExpired(item.expiresAt))
      .map(withoutKeys)
  }

  async findRegistrationByEmail(email) {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': keys.emailPk(email),
          ':skPrefix': keys.emailUserSkPrefix
        },
        Limit: 1
      })
    )

    const lookup = (result.Items ?? []).find(
      (item) => !isExpired(item.expiresAt)
    )
    const userId = lookup?.userId
    if (!userId) {
      return undefined
    }

    return this.getRegistration(userId)
  }

  async putRegistration(userId, registration) {
    const persisted = asPersisted(registration)
    const expiresAt = registrationExpiresAt(this.ttlMs)
    const existingRegistration = await this.getRegistration(userId)

    if (
      existingRegistration?.email &&
      existingRegistration.email !== registration.email
    ) {
      await this.client.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: {
            pk: keys.emailPk(existingRegistration.email),
            sk: keys.emailLookupSk(userId)
          }
        })
      )
    }

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          pk: keys.userPk(userId),
          sk: keys.profileSk,
          itemType: 'PROFILE',
          expiresAt,
          ...persisted
        }
      })
    )

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          pk: keys.registrationIndexPk,
          sk: keys.registrationIndexSk(userId),
          itemType: 'REG_INDEX',
          expiresAt,
          userId,
          email: normalizeEmail(registration.email)
        }
      })
    )

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          pk: keys.emailPk(registration.email),
          sk: keys.emailLookupSk(userId),
          itemType: 'EMAIL_LOOKUP',
          expiresAt,
          userId,
          email: normalizeEmail(registration.email)
        }
      })
    )
  }

  async deleteRegistration(userId) {
    const registration = await this.getRegistration(userId)
    const userItems = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
          ':pk': keys.userPk(userId)
        }
      })
    )

    const deleteRequests = (userItems.Items ?? []).map((item) => ({
      DeleteRequest: {
        Key: {
          pk: item.pk,
          sk: item.sk
        }
      }
    }))

    deleteRequests.push({
      DeleteRequest: {
        Key: {
          pk: keys.registrationIndexPk,
          sk: keys.registrationIndexSk(userId)
        }
      }
    })

    if (registration?.email) {
      deleteRequests.push({
        DeleteRequest: {
          Key: {
            pk: keys.emailPk(registration.email),
            sk: keys.emailLookupSk(userId)
          }
        }
      })
    }

    await this.#batchDelete(deleteRequests)
  }

  async getRelationship(userId, relationshipId) {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: keys.userPk(userId),
          sk: keys.relationshipSk(relationshipId)
        }
      })
    )

    if (isExpired(result.Item?.expiresAt)) {
      return undefined
    }

    return withoutKeys(result.Item)
  }

  async listRelationships(userId) {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': keys.userPk(userId),
          ':skPrefix': 'REL#'
        }
      })
    )

    return (result.Items ?? [])
      .filter((item) => !isExpired(item.expiresAt))
      .map(withoutKeys)
  }

  async putRelationship(userId, relationshipId, relationship) {
    const persisted = asPersisted(relationship)
    const profileResult = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: keys.userPk(userId),
          sk: keys.profileSk
        }
      })
    )
    const profileExpiresAt = profileResult.Item?.expiresAt
    const expiresAt = isExpired(profileExpiresAt)
      ? registrationExpiresAt(this.ttlMs)
      : profileExpiresAt ?? registrationExpiresAt(this.ttlMs)

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          pk: keys.userPk(userId),
          sk: keys.relationshipSk(relationshipId),
          itemType: 'RELATIONSHIP',
          expiresAt,
          ...persisted
        }
      })
    )
  }

  async deleteRelationship(userId, relationshipId) {
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: keys.userPk(userId),
          sk: keys.relationshipSk(relationshipId)
        }
      })
    )
  }

  async deleteAllRelationships(userId) {
    const relationships = await this.listRelationships(userId)
    const deleteRequests = relationships.map((relationship) => ({
      DeleteRequest: {
        Key: {
          pk: keys.userPk(userId),
          sk: keys.relationshipSk(relationship.relationshipId)
        }
      }
    }))

    await this.#batchDelete(deleteRequests)
  }

  async #batchDelete(deleteRequests) {
    if (!deleteRequests.length) {
      return
    }

    for (let index = 0; index < deleteRequests.length; index += 25) {
      const batch = deleteRequests.slice(index, index + 25)
      await this.client.send(
        new BatchWriteCommand({
          RequestItems: {
            [this.tableName]: batch
          }
        })
      )
    }
  }
}

export { DynamoDbRegistrationsStore }
