import { asyncMap } from '~/src/server/common/helpers/async-map.js'

async function findRelationships(userId, cache) {
  const relationshipIds = await cache.get(`relationship-ids:${userId}`)
  if (!relationshipIds) return []

  const relationshipKeys = relationshipIds.map(
    (id) => `relationship:${userId}:${id}`
  )

  const relationships = await asyncMap(relationshipKeys, (key) =>
    cache.get(key)
  )

  return relationships.filter((relationship) => relationship !== null)
}

export { findRelationships }
