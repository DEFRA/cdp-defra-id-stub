// import { oidcConfig } from '~/src/server/oidc/oidc-config.js'

function defaultClaims(session, ttl, host) {
  //   const now = Math.floor(Date.now() / 1000)
  return {
    id: '84a8ecf4-20b7-4b85-820a-b60880d627fc',
    correlationId: '34a5a23d-c50b-491e-9fe7-755500fc0e43',
    sessionId: '86f88f69-1c4e-42bd-a8c9-eab4402739a3',
    contactId: '18192903-20a0-4cb4-ba57-0aa5d4d405ba',
    serviceId: 'cdp-defra-id-stub',
    firstName: 'Test',
    lastName: 'Use',
    email: 'test@example.com',
    uniqueReference: '126d7054-9104-4bdd-8427-a3fe6a1c1cc0',
    loa: 1,
    aal: '1',
    enrolmentCount: 1,
    enrolmentRequestCount: 1,
    currentRelationshipId: '3b7a4305-f14d-429b-b92c-65821a1d46a5',
    relationships: undefined,
    roles: undefined
  }
}

export { defaultClaims }
