import * as crypto from 'crypto'
import { sessions } from '~/src/server/oidc/helpers/session-store.js'
import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'

const showOrganisationPickerController = {
  handler: async (request, h) => {
    const sessionId = request.query.sessionId
    const session = sessions[sessionId]

    if (!session) {
      request.logger.error({ sessionId }, 'Session not found')
      return h.response('Session not found').code(404)
    }

    const user = session.user
    const relationships = await findRelationships(
      user.userId,
      request.registrations
    )

    if (!relationships || relationships.length === 0) {
      request.logger.info({ userId: user.userId }, 'No relationships found')
      return h.response('No relationships found').code(404)
    }

    const forceReselection = session.forceReselection === true

    // Auto-select if single relationship and not forced
    if (relationships.length === 1 && !forceReselection) {
      request.logger.info(
        { relationshipId: relationships[0].relationshipId },
        'Auto-selecting single relationship'
      )
      session.relationshipId = relationships[0].relationshipId
      session.relationship = relationships[0]

      // Complete authorization - redirect to client's redirect_uri
      const location = new URL(session.redirectUri)
      location.searchParams.append('code', session.sessionId)
      location.searchParams.append('state', session.state)
      return h.redirect(location.toString())
    }

    // Transform relationships for radio buttons
    const organisationItems = relationships.map((rel) => ({
      value: rel.relationshipId,
      text: `${rel.organisationName || 'Unnamed Organisation'}`,
      hint: {
        text: `Organisation ID: ${rel.organisationId || 'N/A'} | Role: ${rel.relationshipRole || 'N/A'}`
      }
    }))

    return h.view('oidc/views/organisation-picker', {
      pageTitle: 'Choose a business',
      heading: 'Choose a business',
      action: `${oidcBasePath}/organisations`,
      sessionId,
      organisationItems,
      csrfToken: crypto.randomUUID()
    })
  }
}

const selectOrganisationController = {
  handler: async (request, h) => {
    const payload = request.payload
    const sessionId = payload.sessionId
    const relationshipId = payload.relationshipId

    if (!sessionId || !relationshipId) {
      request.logger.error('Missing sessionId or relationshipId')
      return h.response('Missing required fields').code(400)
    }

    const session = sessions[sessionId]

    if (!session) {
      request.logger.error({ sessionId }, 'Session not found')
      return h.response('Session not found').code(404)
    }

    const user = session.user
    const relationships = await findRelationships(
      user.userId,
      request.registrations
    )
    const selectedRelationship = relationships.find(
      (rel) => rel.relationshipId === relationshipId
    )

    if (!selectedRelationship) {
      request.logger.error(
        { relationshipId },
        'Selected relationship not found'
      )
      return h.response('Invalid relationship selection').code(400)
    }

    // Store selected relationship in session
    session.relationshipId = relationshipId
    session.relationship = selectedRelationship

    request.logger.info(
      {
        relationshipId,
        organisationName: selectedRelationship.organisationName
      },
      'Organisation selected'
    )

    // Complete authorization - redirect to client's redirect_uri
    const location = new URL(session.redirectUri)
    location.searchParams.append('code', session.sessionId)
    location.searchParams.append('state', session.state)
    return h.redirect(location.toString())
  }
}

export { selectOrganisationController, showOrganisationPickerController }
