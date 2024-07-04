const prefix = 'defra-id'

const cacheKeys = {
  registrationIds: `${prefix}:registration-ids`,
  registration: (id) => `${prefix}:registration:${id}`,
  relationshipIds: `${prefix}:relationship-ids`,
  userRelationshipIds: (userId) => `${prefix}:relationship-ids:${userId}`,
  relationship: (userId, relationshipId) =>
    `${prefix}:relationship:${userId}:${relationshipId}`
}

export { cacheKeys }
