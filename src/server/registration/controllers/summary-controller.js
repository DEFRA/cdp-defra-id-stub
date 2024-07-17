import Joi from 'joi'

import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'
import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'
import {
  authorizePath,
  registrationAction,
  registrationPath,
  showLoginPath
} from '~/src/server/registration/helpers/registration-paths.js'

const summaryRegistrationController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      }),
      query: Joi.object({
        redirect_uri: Joi.string().uri().optional()
      })
    }
  },
  handler: async (request, h) => {
    const { userId } = request.params
    const redirectUri = request.query?.redirect_uri

    const registration = await findRegistration(userId, request.registrations)

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const relationships = await findRelationships(userId, request.registrations)

    const loginLink = redirectUri
      ? authorizePath(registration.email, redirectUri, request.logger)
      : showLoginPath()

    return h.view('registration/views/summary', {
      pageTitle: 'DEFRA ID Summary',
      heading: 'DEFRA ID Summary',
      registrationLink: registrationPath(userId, redirectUri),
      newRegistrationLink: registrationAction(redirectUri),
      loginLink,
      registration,
      relationships
    })
  }
}

export { summaryRegistrationController }
