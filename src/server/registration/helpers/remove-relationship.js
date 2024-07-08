import { asyncMap } from '~/src/server/common/helpers/async-map.js'
import { removeFromCachedArray } from '~/src/server/common/helpers/remove-from-cached-array.js'
import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'

async function removeRelationship(userId, relationshipId, cache) {
  await removeFromCachedArray(
    cacheKeys.userRelationshipIds(userId),
    relationshipId,
    cache
  )
  await cache.drop(cacheKeys.relationship(userId, relationshipId))
}

async function removeRelationships(userId, relationships, cache) {
  await asyncMap(relationships, (r) =>
    removeRelationship(userId, r.relationshipId, cache)
  )
}

async function removeAllRelationships(userId, cache) {
  const relationships = await findRelationships(userId, cache)
  await removeRelationships(userId, relationships, cache)
}

export { removeRelationship, removeRelationships, removeAllRelationships }
