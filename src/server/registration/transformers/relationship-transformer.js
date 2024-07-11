import {
  addRoleNamePath,
  removeRoleNamePath
} from '~/src/server/registration/helpers/role-name-link.js'

const removeAction = (relationship) => {
  return {
    href: `relationship/${relationship.relationshipId}/remove`,
    text: 'Remove',
    visuallyHiddenText: 'remove relationship'
  }
}

const currentAction = (relationship) => {
  return {
    href: `relationship/${relationship.relationshipId}/current`,
    text: 'Make current',
    visuallyHiddenText: 'make relationship current'
  }
}

function transformRoleName(relationship) {
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
              href: removeRoleNamePath(relationship),
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
          html: `<a href="${addRoleNamePath(relationship)}" class="govuk-link">Add role name &amp; status</a>`
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

function transformRelationships(relationships, currentRelationship) {
  return relationships.map((r) => {
    return {
      title: currentRelationship ? 'Current relationship' : '',
      actions: {
        items: currentRelationship
          ? [removeAction(r)]
          : [currentAction(r), removeAction(r)]
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
        transformRoleName(r),
        transformRoleStatus(r)
      ]
    }
  })
}

export { transformRelationships }
