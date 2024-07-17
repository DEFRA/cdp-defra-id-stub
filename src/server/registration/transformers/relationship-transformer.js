import {
  addRoleNamePath,
  removeRoleNamePath
} from '~/src/server/registration/helpers/role-name-link.js'

const removeAction = (relationship, queryString) => {
  return {
    href: `relationship/${relationship.relationshipId}/remove${queryString}`,
    text: 'Remove',
    visuallyHiddenText: 'remove relationship'
  }
}

const currentAction = (relationship, queryString) => {
  return {
    href: `relationship/${relationship.relationshipId}/current${queryString}`,
    text: 'Make current',
    visuallyHiddenText: 'make relationship current'
  }
}

function transformRoleName(relationship, queryString) {
  return relationship.roleName
    ? {
        key: {
          text: 'Role Name'
        },
        value: {
          text: relationship.roleName
        },
        actions: {
          items: [
            {
              text: 'Remove',
              href: removeRoleNamePath(relationship, queryString),
              visuallyHiddenText: 'remove role name and status'
            }
          ]
        }
      }
    : {
        key: {
          text: 'Role Name & Status'
        },
        value: {
          html: `<a href="${addRoleNamePath(relationship, queryString)}" class="govuk-link">Add role name &amp; status</a>`
        }
      }
}

function transformRoleStatus(relationship) {
  if (relationship.roleStatus) {
    return {
      key: {
        text: 'Role Status'
      },
      value: {
        text: relationship.roleStatus
      }
    }
  } else {
    return null
  }
}

function transformRelationships(
  relationships,
  currentRelationship,
  queryString
) {
  return relationships.map((r) => {
    return {
      title: currentRelationship ? 'Current relationship' : '',
      actions: {
        items: currentRelationship
          ? [removeAction(r, queryString)]
          : [currentAction(r, queryString), removeAction(r, queryString)]
      },
      rows: [
        {
          key: {
            text: 'Relationship ID'
          },
          value: {
            text: r.relationshipId
          }
        },
        {
          key: {
            text: 'Organisation ID'
          },
          value: {
            text: r.organisationId
          }
        },
        {
          key: {
            text: 'Organisation Name'
          },
          value: {
            text: r.organisationName
          }
        },
        {
          key: {
            text: 'Role'
          },
          value: {
            text: r.relationshipRole
          }
        },
        transformRoleName(r, queryString),
        transformRoleStatus(r)
      ]
    }
  })
}

export { transformRelationships }
