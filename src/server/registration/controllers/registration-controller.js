import * as crypto from 'crypto'
import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { registrationValidation } from '~/src/server/registration/helpers/schemas/registration-validation.js'
import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import {
  newRegistration,
  storeRegistration
} from '~/src/server/registration/helpers/new-registration.js'
import { updateRegistration } from '~/src/server/registration/helpers/update-registration.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'
import {
  transformLoa,
  transformAal
} from '~/src/server/registration/transformers/loa-aal-transformer.js'

const oidcBasePath = config.get('oidc.basePath')

function relationshipPath(userId) {
  return `${oidcBasePath}/${userId}/relationship`
}

const showRegistrationController = {
  handler: async (request, h) => {
    return h.view('registration/views/registration', {
      pageTitle: 'DEFRA ID Setup',
      heading: 'DEFRA ID Setup',
      action: `${oidcBasePath}/setup`,
      userId: crypto.randomUUID(),
      contactId: crypto.randomUUID(),
      uniqueRef: crypto.randomUUID(),
      email: 'some@example.com',
      firstname: 'Firstnamer',
      lastname: 'Lastnameson',
      enrolments: 1,
      enrolmentRequests: 1,
      loaItems: transformLoa(1),
      aalItems: transformAal(1),
      csrfToken: crypto.randomUUID()
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

    const { userid } = payload

    const registration = await newRegistration(userid, request.registrations)
    registration.contactId = payload.contactid
    registration.email = payload.email
    registration.firstname = payload.firstname
    registration.lastname = payload.lastname
    registration.uniqueRef = payload.uniqueref
    registration.loa = payload.loa
    registration.aal = payload.aal
    registration.enrolments = payload.enrolments
    registration.enrolmentRequests = payload.enrolmentrequests
    await storeRegistration(userid, registration, request.registrations)

    //  request.logger.info({ registration }, '======New registration=======')

    return h.redirect(relationshipPath(userid))
  }
}

const showExistingRegistrationController = {
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

    return h.view('registration/views/registration', {
      pageTitle: 'DEFRA ID Setup',
      heading: 'DEFRA ID Setup',
      action: `${oidcBasePath}/${userId}/update`,
      userId,
      contactId: registration.contactId,
      uniqueRef: registration.uniqueRef,
      email: registration.email,
      firstname: registration.firstname,
      lastname: registration.lastname,
      loaItems: transformLoa(registration.loa),
      aalItems: transformAal(registration.aal),
      enrolments: registration.enrolments,
      enrolmentRequests: registration.enrolmentRequests,
      csrfToken: crypto.randomUUID()
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
      request.logger.error({ userId }, '====== Registration not found ======')
      return h.redirect(oidcBasePath)
    }

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

    registration.contactId = payload.contactid
    registration.email = payload.email
    registration.firstname = payload.firstname
    registration.lastname = payload.lastname
    registration.uniqueRef = payload.uniqueref
    registration.loa = payload.loa
    registration.aal = payload.aal
    registration.enrolments = payload.enrolments
    registration.enrolmentRequests = payload.enrolmentrequests
    await updateRegistration(userId, registration, request.registrations)

    //  request.logger.info({ registration }, '======New registration=======')

    return h.redirect(relationshipPath(userId))
  }
}

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

    request.logger.info(
      { registration, relationships },
      '======Summary registration======='
    )

    return h.view('registration/views/summary', {
      pageTitle: 'DEFRA ID Summary',
      heading: 'DEFRA ID Summary',
      registrationLink: `${oidcBasePath}/${userId}`,
      newRegistrationLink: oidcBasePath,
      registration,
      relationships
    })
  }
}

export {
  showRegistrationController,
  registrationController,
  showExistingRegistrationController,
  updateRegistrationController,
  summaryRegistrationController
}
