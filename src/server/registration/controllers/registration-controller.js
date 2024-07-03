import * as crypto from 'crypto'

import { config } from '~/src/config/index.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { registrationValidation } from '~/src/server/registration/helpers/schemas/registration-validation.js'
import {
  newRegistration,
  storeRegistration
} from '~/src/server/registration/helpers/new-registration.js'

const oidcBasePath = config.get('oidc.basePath')

function enrolmentPath(userId) {
  return `${oidcBasePath}/${userId}/enrolment`
}

const showRegistrationController = {
  handler: (request, h) => {
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
    await storeRegistration(userid, registration, request.registrations)

    //  request.logger.info({ registration }, '======New registration=======')

    return h.redirect(enrolmentPath(userid))
  }
}

export { showRegistrationController, registrationController }
