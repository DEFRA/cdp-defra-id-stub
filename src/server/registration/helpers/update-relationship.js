async function updateRelationship(userId, relationshipId, relationship, store) {
  await store.putRelationship(userId, relationshipId, relationship)
}

export { updateRelationship }
