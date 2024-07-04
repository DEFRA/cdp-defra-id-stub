import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'
import { removeFromCachedArray } from '~/src/server/common/helpers/remove-from-cached-array.js'

async function removeRelationship(userId, relationshipId, cache) {
  await removeFromCachedArray(
    cacheKeys.userRelationshipIds(userId),
    relationshipId,
    cache
  )
  await cache.drop(cacheKeys.relationship(userId, relationshipId))
}

export { removeRelationship }
