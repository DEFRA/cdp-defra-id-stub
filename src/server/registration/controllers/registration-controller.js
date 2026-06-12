import * as crypto from 'crypto'
import Joi from 'joi'

import { oidcBasePath } from '#server/oidc/oidc-config.js'
import { registrationValidation } from '#server/registration/helpers/schemas/registration-validation.js'
import { findRegistration } from '#server/registration/helpers/find-registration.js'
import {
  newRegistration,
  storeRegistration
} from '#server/registration/helpers/new-registration.js'
import { updateRegistration } from '#server/registration/helpers/update-registration.js'
import {
  transformLoa,
  transformAal
} from '#server/registration/transformers/loa-aal-transformer.js'
import {
  registrationAction,
  registrationPath,
  relationshipPath,
  updateRegistrationAction
} from '#server/registration/helpers/registration-paths.js'
import {
  flashValidationFailure,
  readValidationFailure
} from '#server/registration/helpers/validation-failure.js'

function buildRegistrationViewContext({
  heading,
  pageTitle,
  action,
  redirectUri,
  formValues,
  formErrors,
  defaults = {}
}) {
  return {
    pageTitle,
    heading,
    action,
    userId: formValues.userId ?? defaults.userId ?? crypto.randomUUID(),
    contactId:
      formValues.contactId ?? defaults.contactId ?? crypto.randomUUID(),
    uniqueReference:
      formValues.uniqueReference ??
      defaults.uniqueReference ??
      crypto.randomUUID(),
    email: formValues.email ?? defaults.email,
    firstName: formValues.firstName ?? defaults.firstName,
    lastName: formValues.lastName ?? defaults.lastName,
    enrolmentCount: formValues.enrolmentCount ?? defaults.enrolmentCount,
    enrolmentRequestCount:
      formValues.enrolmentRequestCount ?? defaults.enrolmentRequestCount,
    loaItems: transformLoa(formValues.loa ?? defaults.loa ?? '1'),
    aalItems: transformAal(formValues.aal ?? defaults.aal ?? '1'),
    csrfToken: formValues.csrfToken ?? crypto.randomUUID(),
    redirectUri: formValues.redirect_uri ?? redirectUri,
    formErrors
  }
}

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
    const { formValues, formErrors } = readValidationFailure(request)

    return h.view(
      'registration/views/registration',
      buildRegistrationViewContext({
        pageTitle: 'DEFRA ID Registration',
        heading: 'DEFRA ID Temporary Registration',
        action: registrationAction(),
        redirectUri,
        formValues,
        formErrors
      })
    )
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
      flashValidationFailure(request, payload, validationResult.error)
      return h.redirect(registrationAction(payload?.redirect_uri))
    }

    const { userId } = payload
    const registration = await newRegistration(userId)
    registration.contactId = payload.contactId
    registration.email = payload.email
    registration.firstName = payload.firstName
    registration.lastName = payload.lastName
    registration.uniqueReference = payload.uniqueReference
    registration.loa = payload.loa
    registration.aal = payload.aal
    registration.enrolmentCount = payload.enrolmentCount
    registration.enrolmentRequestCount = payload.enrolmentRequestCount
    await storeRegistration(userId, registration, request.registrationsStore)

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
    const registration = await findRegistration(
      userId,
      request.registrationsStore
    )

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const { formValues, formErrors } = readValidationFailure(request)

    return h.view(
      'registration/views/registration',
      buildRegistrationViewContext({
        pageTitle: 'DEFRA ID Setup',
        heading: 'DEFRA ID Setup',
        action: updateRegistrationAction(userId),
        redirectUri,
        formValues,
        formErrors,
        defaults: {
          userId,
          contactId: registration.contactId,
          uniqueReference: registration.uniqueReference,
          email: registration.email,
          firstName: registration.firstName,
          lastName: registration.lastName,
          loa: registration.loa,
          aal: registration.aal,
          enrolmentCount: registration.enrolmentCount,
          enrolmentRequestCount: registration.enrolmentRequestCount
        }
      })
    )
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

    const registration = await findRegistration(
      userId,
      request.registrationsStore
    )

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const validationResult = registrationValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      request.logger.warn(validationResult?.error, 'Payload error')
      flashValidationFailure(request, payload, validationResult.error)
      return h.redirect(registrationPath(userId, payload?.redirect_uri))
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
    await updateRegistration(userId, registration, request.registrationsStore)

    return h.redirect(relationshipPath(userId, payload.redirect_uri))
  }
}

export {
  showRegistrationController,
  registrationController,
  showExistingRegistrationController,
  updateRegistrationController
}
