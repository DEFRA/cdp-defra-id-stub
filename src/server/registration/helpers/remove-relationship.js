import { asyncMap } from '#server/common/helpers/async-map.js'
import { findRelationships } from '#server/registration/helpers/find-relationships.js'

async function removeRelationship(userId, relationshipId, store) {
  await store.deleteRelationship(userId, relationshipId)
}

async function removeRelationships(userId, relationships, store) {
  await asyncMap(relationships, (r) =>
    removeRelationship(userId, r.relationshipId, store)
  )
}

async function removeAllRelationships(userId, store) {
  const relationships = await findRelationships(userId, store)
  await removeRelationships(userId, relationships, store)
}

export { removeRelationship, removeRelationships, removeAllRelationships }
