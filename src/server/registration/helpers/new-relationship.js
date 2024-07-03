import { addToCachedArray } from '~/src/server/common/helpers/add-to-cached-array.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()

async function addRelationshipId(userId, relationshipId, cache) {
  await addToCachedArray('relationship-ids', relationshipId, cache)
  await addToCachedArray(`relationship-ids:${userId}`, relationshipId, cache)
}

async function storeRelationship(userId, relationshipId, relationship, cache) {
  logger.info({ userId, relationshipId }, 'Storing relationship')
  await cache.set(`relationship:${userId}:${relationshipId}`, relationship)
}

async function newRelationship(userId, relationshipId, cache) {
  const relationship = {
    userId,
    relationshipId,
    created: new Date()
  }
  await addRelationshipId(userId, relationshipId, cache)
  return relationship
}

export { newRelationship, storeRelationship }
