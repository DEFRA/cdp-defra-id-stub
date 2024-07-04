const removeAction = (relationship) => {
  return {
    href: `relationship/${relationship.relationshipId}/remove`,
    text: 'Remove',
    visuallyHiddenText: 'remove relationship'
  }
}

const currentAction = {
  href: '#',
  text: 'Make current',
  visuallyHiddenText: 'make relationship current'
}

function transformRelationships(relationships, currentRelationship) {
  return relationships.map((r) => {
    return {
      title: currentRelationship ? 'Current relationship' : '',
      actions: {
        items: currentRelationship
          ? [removeAction(r)]
          : [currentAction, removeAction(r)]
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
        {
          key: {
            text: 'Role Name'
          },
          value: {
            html: '<a href="#" class="govuk-link">Add role name &amp; status</a>'
          }
        },
        {
          key: {
            text: 'Role Status'
          },
          value: {
            text: ''
          }
        }
      ]
    }
  })
}

export { transformRelationships }
