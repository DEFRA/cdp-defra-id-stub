import { findRegistrationByEmail } from '~/src/server/registration/helpers/find-registration.js'
import { findUserEmail } from '~/src/server/oidc/helpers/users.js'

async function defaultClaims(session, ttl, host) {
  const username = session.user
  const email = await findUserEmail(username)
  const registration = await findRegistrationByEmail(email)

  if (!registration) {
    return null
  }

  return {
    id: registration.userId,
    correlationId: '34a5a23d-c50b-491e-9fe7-755500fc0e43', // TODO: Not sure what this is
    sessionId: session.sessionId,
    contactId: registration.contactId,
    serviceId: 'cdp-defra-id-stub',
    firstName: registration.firstname,
    lastName: registration.lastname,
    email,
    uniqueReference: registration.uniqueRef,
    loa: registration.loa,
    aal: '1', // TODO: Not sure what this is
    enrolmentCount: registration.enrolments,
    enrolmentRequestCount: registration.enrolmentrequests,
    currentRelationshipId: registration.currentRelationship,
    relationships: undefined, // TODO: Need syntax/format
    roles: undefined // TODO: Need syntax/format
  }
}

export { defaultClaims }
