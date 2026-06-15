async function findRelationships(userId, store) {
  return store.listRelationships(userId)
}

async function findNonCurrentRelationships(
  userId,
  currentRelationshipId,
  store
) {
  const relationships = await findRelationships(userId, store)
  const otherRelationships = relationships.filter(
    (relationship) => relationship.relationshipId !== currentRelationshipId
  )
  return otherRelationships
}

async function findRelationship(userId, relationshipId, store) {
  return store.getRelationship(userId, relationshipId)
}

export { findRelationship, findNonCurrentRelationships, findRelationships }
