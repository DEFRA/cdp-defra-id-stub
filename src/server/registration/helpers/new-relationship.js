import { addToCachedArray } from '~/src/server/common/helpers/add-to-cached-array.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'

const logger = createLogger()

async function addRelationshipId(userId, relationshipId, cache) {
  await addToCachedArray(cacheKeys.relationshipIds, relationshipId, cache)
  await addToCachedArray(
    cacheKeys.userRelationshipIds(userId),
    relationshipId,
    cache
  )
}

async function storeRelationship(userId, relationshipId, relationship, cache) {
  logger.info({ userId, relationshipId }, 'Storing relationship')
  await cache.set(cacheKeys.relationship(userId, relationshipId), relationship)
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
