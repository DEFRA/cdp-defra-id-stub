import { config } from '~/src/config/index.js'
import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'
import { includeRedirect } from '~/src/server/registration/helpers/include-redirect.js'

const appBaseUrl = config.get('appBaseUrl')

function showLoginPath(redirectUri) {
  return includeRedirect(`${oidcBasePath}/login`, redirectUri)
}
function authorizePath(email, redirectUri) {
  const authorizeUrl = new URL(redirectUri, appBaseUrl)
  authorizeUrl.searchParams.append('user', email)
  return authorizeUrl.toString()
}

function registrationPath(userId, redirectUri) {
  return includeRedirect(`${oidcBasePath}/register/${userId}`, redirectUri)
}

function registrationAction(redirectUri) {
  return includeRedirect(`${oidcBasePath}/register`, redirectUri)
}

function relationshipPath(userId, redirectUri) {
  return includeRedirect(
    `${oidcBasePath}/register/${userId}/relationship`,
    redirectUri
  )
}

function summaryPath(userId, redirectUri) {
  return includeRedirect(
    `${oidcBasePath}/register/${userId}/summary`,
    redirectUri
  )
}

function updateRegistrationAction(userId) {
  return `${oidcBasePath}/register/${userId}/update`
}

function roleNamePath(userId, relationshipId, redirectUri) {
  return includeRedirect(
    `${oidcBasePath}/register/${userId}/relationship/${relationshipId}/role-name`,
    redirectUri
  )
}

export {
  authorizePath,
  registrationAction,
  registrationPath,
  relationshipPath,
  roleNamePath,
  showLoginPath,
  summaryPath,
  updateRegistrationAction
}
