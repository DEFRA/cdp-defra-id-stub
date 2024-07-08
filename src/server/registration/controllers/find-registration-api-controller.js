import Joi from 'joi'

import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'

const findRegistrationApiController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const { userId } = request.params

    const registration = await findRegistration(userId, request.registrations)

    if (registration) {
      request.logger.info({ userId }, 'Registration found')

      const relationships = await findRelationships(
        userId,
        request.registrations
      )
      registration.relationships = relationships
      const response = {
        registration
      }
      return h.response(response).code(200)
    } else {
      request.logger.info({ userId }, 'Registration not found')
      const response = {
        message: 'Registration not found'
      }
      return h.response(response).code(404)
    }
  }
}

export { findRegistrationApiController }
