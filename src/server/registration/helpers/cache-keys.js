const cacheKeys = {
  // Cache keys for the registration process
  registrationIds: 'registration-ids',
  registration: (id) => `registration:${id}`,
  // Cache keys for the relationship process
  relationshipIds: 'relationship-ids',
  relationship: (userId, relationshipId) =>
    `relationship:${userId}:${relationshipId}`,
  userRelationshipIds: (userId) => `relationship-ids:${userId}`
}

export { cacheKeys }
