import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'

function roleNameBase(relationship) {
  return `${oidcBasePath}/register/${relationship.userId}/relationship/${relationship.relationshipId}`
}

function addRoleNamePath(relationship, queryString) {
  return `${roleNameBase(relationship)}/role-name${queryString}`
}

function removeRoleNamePath(relationship, queryString) {
  return `${roleNameBase(relationship)}/role-name/remove${queryString}`
}

export { addRoleNamePath, removeRoleNamePath }
