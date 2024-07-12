import { findRegistrationByEmail } from '~/src/server/registration/helpers/find-registration.js'
// import { findUserEmail } from '~/src/server/oidc/helpers/users.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'

const logger = createLogger()

async function defaultClaims(session, ttl, host, cache) {
  let email
  if (session.user?.email) {
    email = session.user.email
  } else if (session.user?.preferred_username) {
    email = session.user.preferred_username
  } else {
    logger.warn('No email found for session user')
    return null
  }

  if (!email) {
    logger.warn('No email found for user')
    return null
  }
  logger.info({ email }, 'Email found')

  const registration = await findRegistrationByEmail(email, cache)

  if (!registration) {
    logger.warn('No registration found for user email')
    return null
  }
  logger.info('Registration found')

  const relationships = await findRelationships(registration.userId, cache)
  const relationshipIdsRow = relationships.map(
    (r) =>
      `${r.relationshipId}:${r.organisationId}:` +
      `${r.organisationName}:0:${r.role}:0`
  )
  const rolesRow = relationships
    .filter((r) => r.roleName)
    .map((r) => `${r.relationshipId}:${r.roleName}:${r.roleStatus}`)

  return {
    id: registration.userId,
    sub: registration.userId,
    correlationId: '34a5a23d-c50b-491e-9fe7-755500fc0e43', // TODO: Not sure where this is from
    sessionId: session.sessionId,
    contactId: registration.contactId,
    serviceId: 'cdp-defra-id-stub', // TODO: Should be UUID really
    firstName: registration.firstName,
    lastName: registration.lastName,
    email,
    uniqueReference: registration.uniqueReference,
    loa: registration.loa,
    aal: registration.aal,
    enrolmentCount: registration.enrolmentCount,
    enrolmentRequestCount: registration.enrolmentRequestCount,
    currentRelationshipId: registration.currentRelationshipId,
    relationships: relationshipIdsRow.join(','),
    roles: rolesRow.join(',')
  }
}

export { defaultClaims }
