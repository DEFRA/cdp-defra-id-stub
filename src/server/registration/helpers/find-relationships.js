import { asyncMap } from '~/src/server/common/helpers/async-map.js'
import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'

async function findRelationships(userId, cache) {
  const relationshipIds = await cache.get(cacheKeys.userRelationshipIds(userId))
  if (!relationshipIds) return []

  const relationshipKeys = relationshipIds.map((id) =>
    cacheKeys.relationship(userId, id)
  )

  const relationships = await asyncMap(relationshipKeys, (key) =>
    cache.get(key)
  )

  return relationships.filter((relationship) => relationship !== null)
}

async function findRelationship(userId, relationshipId, cache) {
  const relationship = await cache.get(
    cacheKeys.relationship(userId, relationshipId)
  )
  return relationship
}

export { findRelationship, findRelationships }
