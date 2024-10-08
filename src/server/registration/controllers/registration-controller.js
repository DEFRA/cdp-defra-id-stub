import * as crypto from 'crypto'
import Joi from 'joi'

import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { registrationValidation } from '~/src/server/registration/helpers/schemas/registration-validation.js'
import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import {
  newRegistration,
  storeRegistration
} from '~/src/server/registration/helpers/new-registration.js'
import { updateRegistration } from '~/src/server/registration/helpers/update-registration.js'
import {
  transformLoa,
  transformAal
} from '~/src/server/registration/transformers/loa-aal-transformer.js'
import {
  registrationAction,
  relationshipPath,
  updateRegistrationAction
} from '~/src/server/registration/helpers/registration-paths.js'

const showRegistrationController = {
  options: {
    validate: {
      query: Joi.object({
        redirect_uri: Joi.string().uri().optional()
      })
    }
  },
  handler: async (request, h) => {
    const redirectUri = request.query?.redirect_uri

    return h.view('registration/views/registration', {
      pageTitle: 'DEFRA ID Registration',
      heading: 'DEFRA ID Temporary Registration',
      action: registrationAction(),
      userId: crypto.randomUUID(),
      contactId: crypto.randomUUID(),
      uniqueReference: crypto.randomUUID(),
      loaItems: transformLoa(1),
      aalItems: transformAal(1),
      csrfToken: crypto.randomUUID(),
      redirectUri
    })
  }
}

const registrationController = {
  handler: async (request, h) => {
    const payload = request?.payload

    const validationResult = registrationValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      request.logger.warn(validationResult?.error, '======Payload error=======')
      const errorDetails = buildErrorDetails(validationResult.error.details)

      request.yar.flash('validationFailure', {
        formValues: payload,
        formErrors: errorDetails
      })
      return h.redirect(oidcBasePath)
    }

    const { userId } = payload
    const registration = await newRegistration(userId, request.registrations)
    registration.contactId = payload.contactId
    registration.email = payload.email
    registration.firstName = payload.firstName
    registration.lastName = payload.lastName
    registration.uniqueReference = payload.uniqueReference
    registration.loa = payload.loa
    registration.aal = payload.aal
    registration.enrolmentCount = payload.enrolmentCount
    registration.enrolmentRequestCount = payload.enrolmentRequestCount
    await storeRegistration(userId, registration, request.registrations)

    request.logger.info(
      { email: registration.email, id: registration.userId },
      'New registration'
    )

    return h.redirect(relationshipPath(userId, payload.redirect_uri))
  }
}

const showExistingRegistrationController = {
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

    return h.view('registration/views/registration', {
      pageTitle: 'DEFRA ID Setup',
      heading: 'DEFRA ID Setup',
      action: updateRegistrationAction(userId),
      userId,
      contactId: registration.contactId,
      uniqueReference: registration.uniqueReference,
      email: registration.email,
      firstName: registration.firstName,
      lastName: registration.lastName,
      loaItems: transformLoa(registration.loa),
      aalItems: transformAal(registration.aal),
      enrolmentCount: registration.enrolmentCount,
      enrolmentRequestCount: registration.enrolmentRequestCount,
      csrfToken: crypto.randomUUID(),
      redirectUri
    })
  }
}

const updateRegistrationController = {
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
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const validationResult = registrationValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      request.logger.warn(validationResult?.error, 'Payload error')
      const errorDetails = buildErrorDetails(validationResult.error.details)

      request.yar.flash('validationFailure', {
        formValues: payload,
        formErrors: errorDetails
      })
      return h.redirect(oidcBasePath)
    }

    registration.contactId = payload.contactId
    registration.email = payload.email
    registration.firstName = payload.firstName
    registration.lastName = payload.lastName
    registration.uniqueReference = payload.uniqueReference
    registration.loa = payload.loa
    registration.aal = payload.aal
    registration.enrolmentCount = payload.enrolmentCount
    registration.enrolmentRequestCount = payload.enrolmentRequestCount
    await updateRegistration(userId, registration, request.registrations)

    return h.redirect(relationshipPath(userId, payload.redirect_uri))
  }
}

export {
  showRegistrationController,
  registrationController,
  showExistingRegistrationController,
  updateRegistrationController
}
