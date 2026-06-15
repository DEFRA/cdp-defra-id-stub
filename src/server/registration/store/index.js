import { createLogger } from '#server/common/helpers/logging/logger.js'
import { createDynamoDbDocumentClient } from '#server/registration/store/dynamodb-client.js'
import { DynamoDbRegistrationsStore } from '#server/registration/store/registrations-store.js'
import { MemoryRegistrationsStore } from '#server/registration/store/memory-store.js'

const logger = createLogger()

function createRegistrationsStore(config) {
  const engine = config.get('registrationsStore.engine')

  if (engine === 'memory') {
    logger.info('Using in-memory registrations store')
    return new MemoryRegistrationsStore({
      ttlMs: config.get('registrationsStore.ttl')
    })
  }

  logger.info('Using DynamoDB registrations store')
  const client = createDynamoDbDocumentClient({
    endpoint: config.get('aws.dynamoDb.endpoint'),
    region: config.get('aws.region')
  })

  return new DynamoDbRegistrationsStore({
    client,
    tableName: config.get('dynamoDb.registrationsTableName'),
    ttlMs: config.get('registrationsStore.ttl')
  })
}

export { createRegistrationsStore }
