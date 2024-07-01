import * as crypto from 'crypto'
import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { detailsValidation } from '~/src/server/oidc/helpers/schemas/details-validation.js'
import { enrolmentValidation } from '~/src/server/oidc/helpers/schemas/enrolment-validation.js'
import { relationshipValidation } from '~/src/server/oidc/helpers/schemas/relationship-validation.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const oidcBasePath = config.get('oidc.basePath')

function enrolmentPath(userId) {
  return `${oidcBasePath}/${userId}/enrolment`
}

function relationshipPath(userId) {
  return `${oidcBasePath}/${userId}/relationship`
}

const logger = createLogger('oidc/setup-controller')

const showSetupDetailsController = {
  handler: (request, h) => {
    return h.view('oidc/views/details', {
      pageTitle: 'DEFRA ID Setup',
      heading: 'DEFRA ID Setup',
      action: `${oidcBasePath}/setup`,
      userId: crypto.randomUUID(),
      contactId: crypto.randomUUID(),
      uniqueRef: crypto.randomUUID(),
      csrfToken: crypto.randomUUID()
    })
  }
}

const setupDetailsController = {
  handler: (request, h) => {
    const payload = request?.payload

    const validationResult = detailsValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      logger.warn(validationResult?.error, '======Payload error=======')
      const errorDetails = buildErrorDetails(validationResult.error.details)

      request.yar.flash('validationFailure', {
        formValues: payload,
        formErrors: errorDetails
      })
      return h.redirect(oidcBasePath)
    }

    logger.info(payload, '======Payload details received=======')

    const { userid } = payload

    return h.redirect(enrolmentPath(userid))
  }
}

const showSetupEnrolmentController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    }
  },
  handler: (request, h) => {
    const { userId } = request.params
    return h.view('oidc/views/enrolment', {
      pageTitle: 'DEFRA ID Setup Enrolment',
      heading: 'DEFRA ID Setup Enrolment',
      action: enrolmentPath(userId),
      userId,
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
  handler: (request, h) => {
    const payload = request?.payload
    const { userId } = request.params

    const validationResult = enrolmentValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      logger.warn(validationResult?.error, '======Payload error=======')
      const errorDetails = buildErrorDetails(validationResult.error.details)

      request.yar.flash('validationFailure', {
        formValues: payload,
        formErrors: errorDetails
      })
      return h.redirect(enrolmentPath(userId))
    }

    logger.info(payload, '======Payload enrolment received=======')
    return h.redirect(relationshipPath(userId))
  }
}

const showSetupRelationshipController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    }
  },
  handler: (request, h) => {
    const { userId } = request.params
    return h.view('oidc/views/relationships', {
      pageTitle: 'DEFRA ID Relationships Setup',
      heading: 'DEFRA ID Relationships Setup',
      action: relationshipPath(userId),
      userId,
      csrfToken: crypto.randomUUID(),
      selectedRelationshipId: crypto.randomUUID()
    })
  }
}

const setupRelationshipController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    }
  },
  handler: (request, h) => {
    const payload = request?.payload
    const { userId } = request.params

    const validationResult = relationshipValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      logger.warn(validationResult?.error, '======Payload error=======')
      const errorDetails = buildErrorDetails(validationResult.error.details)

      request.yar.flash('validationFailure', {
        formValues: payload,
        formErrors: errorDetails
      })
      return h.redirect(relationshipPath(userId))
    }

    logger.info(payload, '======Payload relationships received=======')
    return h.redirect('/')
  }
}

export {
  showSetupDetailsController,
  showSetupEnrolmentController,
  showSetupRelationshipController,
  setupDetailsController,
  setupEnrolmentController,
  setupRelationshipController
}
