import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'

const oidcBasePath = config.get('oidc.basePath')

function registrationPathWithId(userId) {
  return `${oidcBasePath}/register/${userId}`
}

const registrationPath = `${oidcBasePath}/register`

const summaryRegistrationController = {
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

    if (!registration) {
      request.logger.error({ userId }, '====== Registration not found ======')
      return h.redirect(oidcBasePath)
    }

    const relationships = await findRelationships(userId, request.registrations)

    //  request.logger.info(
    //    { registration, relationships },
    //    '======Summary registration======='
    //  )

    return h.view('registration/views/summary', {
      pageTitle: 'DEFRA ID Summary',
      heading: 'DEFRA ID Summary',
      registrationLink: registrationPathWithId(userId),
      newRegistrationLink: registrationPath,
      registration,
      relationships
    })
  }
}
export { summaryRegistrationController }
