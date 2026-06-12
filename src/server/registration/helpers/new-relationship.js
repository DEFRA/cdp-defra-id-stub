import { createLogger } from '#server/common/helpers/logging/logger.js'

const logger = createLogger()

async function storeRelationship(userId, relationshipId, relationship, store) {
  logger.info({ userId, relationshipId }, 'Storing relationship')
  await store.putRelationship(userId, relationshipId, relationship)
}

async function newRelationship(userId, relationshipId) {
  const relationship = {
    userId,
    relationshipId,
    created: new Date()
  }
  return relationship
}

export { newRelationship, storeRelationship }
