import Joi from 'joi'

import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import { removeAllRelationships } from '~/src/server/registration/helpers/remove-relationship.js'
import { removeRegistration } from '~/src/server/registration/helpers/remove-registration.js'

const expireRegistrationApiController = {
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

    await removeAllRelationships(userId, request.registrations)

    if (registration) {
      request.logger.info({ userId }, 'Registration expired')
      await removeRegistration(userId, request.registrations)
    } else {
      request.logger.info({ userId }, 'Registration not found')
    }

    const response = {
      userId,
      message: 'Registration expired'
    }
    return h.response(response).code(200)
  }
}

export { expireRegistrationApiController }
