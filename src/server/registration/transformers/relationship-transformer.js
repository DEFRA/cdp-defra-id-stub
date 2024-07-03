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
            text: 'Relationship ID',
            classes: 'govuk-!-width-one-third'
          },
          value: {
            text: r.relationshipId,
            classes: 'govuk-!-width-one-third'
          }
        },
        {
          key: {
            text: 'Organisation ID',
            classes: 'govuk-!-width-one-third'
          },
          value: {
            text: r.organisationId,
            classes: 'govuk-!-width-one-third'
          }
        },
        {
          key: {
            text: 'Organisation Name',
            classes: 'govuk-!-width-one-third'
          },
          value: {
            text: r.organisationName,
            classes: 'govuk-!-width-one-third'
          }
        },
        {
          key: {
            text: 'Role Name'
          },
          value: {
            html: '<a href="#" class="govuk-link">Add role &amp; status</a>'
          },
          actions: {
            items: [
              {
                href: '/relationships',
                text: 'Remove',
                visuallyHiddenText: 'role from relationship'
              }
            ]
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
