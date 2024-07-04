import { findRegistrationByEmail } from '~/src/server/registration/helpers/find-registration.js'
// import { findUserEmail } from '~/src/server/oidc/helpers/users.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

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

  return {
    id: registration.userId,
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
    relationships: undefined, // TODO: Need syntax/format
    roles: undefined // TODO: Need syntax/format
  }
}

export { defaultClaims }
