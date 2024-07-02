import * as crypto from 'crypto'
import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { relationshipValidation } from '~/src/server/registration/helpers/schemas/relationship-validation.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const oidcBasePath = config.get('oidc.basePath')

function enrolmentPath(userId) {
  return `${oidcBasePath}/${userId}/enrolment`
}

function relationshipPath(userId) {
  return `${oidcBasePath}/${userId}/relationship`
}

function selectedRelationshipPath(userId, relationshipId) {
  return `${oidcBasePath}/${userId}/relationship/${relationshipId}`
}

function confirmPath(userId) {
  return `${oidcBasePath}/${userId}/confirm`
}

const logger = createLogger('oidc/setup-controller')

const showAddRelationshipController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    }
  },
  handler: (request, h) => {
    const { userId } = request.params
    return h.view('oidc/views/relationships-none', {
      pageTitle: 'DEFRA ID Relationships Setup',
      heading: 'DEFRA ID Relationships Setup',
      action: relationshipPath(userId),
      userId,
      csrfToken: crypto.randomUUID(),
      relationshipId: crypto.randomUUID(),
      organisationId: crypto.randomUUID(),
      organisationName: 'DEFRA Example Organisation',
      enrolmentLink: enrolmentPath(userId)
    })
  }
}

const addRelationshipController = {
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
    const { relationshipid } = payload

    logger.info(payload, '====== Add relationships received =======')

    return h.redirect(selectedRelationshipPath(userId, relationshipid))
  }
}

const showRelationshipListController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required(),
        relationshipId: Joi.string().uuid().required()
      })
    }
  },
  handler: (request, h) => {
    const { userId } = request.params

    logger.info('====== Show relationships list =======')

    return h.view('oidc/views/relationships-list', {
      pageTitle: 'DEFRA ID Relationships Setup',
      heading: 'DEFRA ID Relationships Setup',
      action: relationshipPath(userId),
      userId,
      enrolmentLink: enrolmentPath(userId),
      confirmLink: confirmPath(userId),
      csrfToken: crypto.randomUUID(),
      selectedRelationshipId: crypto.randomUUID()
    })
  }
}

export {
  showAddRelationshipController,
  showRelationshipListController,
  addRelationshipController
}
