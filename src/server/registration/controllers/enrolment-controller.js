import * as crypto from 'crypto'
import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { enrolmentValidation } from '~/src/server/registration/helpers/schemas/enrolment-validation.js'
import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import { updateRegistration } from '~/src/server/registration/helpers/update-registration.js'

const oidcBasePath = config.get('oidc.basePath')

function enrolmentPath(userId) {
  return `${oidcBasePath}/${userId}/enrolment`
}

function relationshipPath(userId) {
  return `${oidcBasePath}/${userId}/relationship`
}

const showEnrolmentController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const { userId } = request.params
    //  request.logger.info(userId, '====== show enrolment =======')

    const registration = await findRegistration(userId, request.registrations)

    if (!registration) {
      request.logger.error({ userId }, '====== Registration not found ======')
      // return h.response().code(404)
      return h.redirect(oidcBasePath)
    }

    return h.view('registration/views/enrolment', {
      pageTitle: 'DEFRA ID Setup Enrolment',
      heading: 'DEFRA ID Setup Enrolment',
      action: enrolmentPath(userId),
      userId,
      enrolments: registration?.enrolments ?? 1,
      enrolmentRequests: registration?.enrolmentRequests ?? 1,
      detailsLink: oidcBasePath,
      csrfToken: crypto.randomUUID()
    })
  }
}

const setupEnrolmentController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const { userId } = request.params

    const registration = await findRegistration(userId, request.registrations)

    if (!registration) {
      request.logger.error({ userId }, '====== Registration not found ======')
      return h.redirect(oidcBasePath)
    }

    const validationResult = enrolmentValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      request.logger.warn(validationResult?.error, '======Payload error=======')
      const errorDetails = buildErrorDetails(validationResult.error.details)

      request.yar.flash('validationFailure', {
        formValues: payload,
        formErrors: errorDetails
      })
      return h.redirect(enrolmentPath(userId))
    }
    //  request.logger.info(payload, '======Payload enrolment received=======')
    //  request.logger.info(
    //    { registration },
    //    '======Enrolment existing registration======='
    //  )

    registration.loa = payload.loa
    registration.enrolments = payload.enrolments
    registration.enrolmentRequests = payload.enrolmentRequests

    //  request.logger.info(
    //    { registration },
    //    '======Enrolment updated registration======='
    //  )

    await updateRegistration(userId, registration, request.registrations)

    return h.redirect(relationshipPath(userId))
  }
}

export { showEnrolmentController, setupEnrolmentController }
