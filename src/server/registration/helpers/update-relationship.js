import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'

async function updateRelationship(userId, relationshipId, relationship, cache) {
  await cache.set(cacheKeys.relationship(userId, relationshipId), relationship)
}

export { updateRelationship }
