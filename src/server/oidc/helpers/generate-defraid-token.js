import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import { oidcConfig } from '~/src/server/oidc/oidc-config.js'
import { randomUUID } from 'node:crypto'
import { findRegistrationByEmail } from '~/src/server/registration/helpers/find-registration.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'

const logger = createLogger()

export async function generateDefraIdToken(session, host, cache) {
  const email = session.user?.email ?? session.user?.preferred_username
  const registration = await findRegistrationByEmail(email, cache)
  const relationships = await findRelationships(registration?.userId, cache)

  if (!email) {
    logger.warn('No email found for user')
    return null
  }
  logger.debug({ email }, 'Email found')

  if (!registration) {
    logger.warn('No registration found for user email')
    return null
  }
  logger.info('Registration found')

  const relationshipIdsRow = relationships.map(
    (r) =>
      `${r.relationshipId}:${r.organisationId}:` +
      `${r.organisationName}:0:${r.relationshipRole}:0`
  )
  const rolesRow = relationships
    .filter((r) => r.roleName)
    .map((r) => `${r.relationshipId}:${r.roleName}:${r.roleStatus}`)

  return {
    id: registration.userId,
    sub: registration.userId,
    iss: host + oidcConfig.issuerBase, // issuer
    correlationId: randomUUID(),
    sessionId: session.sessionId,
    contactId: registration.contactId,
    serviceId: 'e84a398b-8104-47a2-86ae-de1168e4132f', // TODO: confirm where this should be set.
    firstName: registration.firstName,
    lastName: registration.lastName,
    email,
    uniqueReference: registration.uniqueReference,
    loa: registration.loa,
    aal: registration.aal,
    enrolmentCount: registration.enrolmentCount,
    enrolmentRequestCount: registration.enrolmentRequestCount,
    currentRelationshipId: registration.currentRelationshipId,
    relationships: relationshipIdsRow,
    roles: rolesRow
  }
}
