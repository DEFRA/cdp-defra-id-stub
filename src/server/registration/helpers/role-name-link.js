import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'

function roleNameBase(relationship) {
  return `${oidcBasePath}/register/${relationship.userId}/relationship/${relationship.relationshipId}`
}

function addRoleNamePath(relationship) {
  return `${roleNameBase(relationship)}/role-name`
}

function removeRoleNamePath(relationship) {
  return `${roleNameBase(relationship)}/role-name/remove`
}

export { addRoleNamePath, removeRoleNamePath }
