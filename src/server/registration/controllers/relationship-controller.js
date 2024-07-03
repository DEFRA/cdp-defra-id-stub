import * as crypto from 'crypto'
import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { relationshipValidation } from '~/src/server/registration/helpers/schemas/relationship-validation.js'
import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'
import {
  newRelationship,
  storeRelationship
} from '~/src/server/registration/helpers/new-relationship.js'

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

const showAddRelationshipController = {
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

    return h.view('registration/views/relationships-none', {
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
  handler: async (request, h) => {
    const payload = request?.payload
    const { userId } = request.params

    const registration = await findRegistration(userId, request.registrations)

    if (!registration) {
      request.logger.error({ userId }, '====== Registration not found ======')
      return h.redirect(oidcBasePath)
    }

    request.logger.info({ registration }, '======Registration found=======')

    const validationResult = relationshipValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      request.logger.warn(validationResult?.error, '======Payload error=======')
      const errorDetails = buildErrorDetails(validationResult.error.details)

      request.yar.flash('validationFailure', {
        formValues: payload,
        formErrors: errorDetails
      })
      return h.redirect(relationshipPath(userId))
    }

    request.logger.info(
      { payload },
      '====== Add relationships received ======='
    )

    const { relationshipid } = payload
    const relationship = await newRelationship(
      userId,
      relationshipid,
      request.registrations
    )
    relationship.organisationId = payload.organisationid
    relationship.organisationName = payload.organisationname
    await storeRelationship(
      userId,
      relationshipid,
      relationship,
      request.registrations
    )

    request.logger.info({ relationship }, '====== Add relationships =======')

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
  handler: async (request, h) => {
    const { userId } = request.params

    const registration = await findRegistration(userId, request.registrations)

    if (!registration) {
      request.logger.error({ userId }, '====== Registration not found ======')
      return h.redirect(oidcBasePath)
    }

    request.logger.info('====== Show relationships list =======')

    const relationships = await findRelationships(userId, request.registrations)

    request.logger.info({ relationships }, '====== Relationships found =======')

    return h.view('registration/views/relationships-list', {
      pageTitle: 'DEFRA ID Relationships Setup',
      heading: 'DEFRA ID Relationships Setup',
      action: relationshipPath(userId),
      userId,
      enrolmentLink: enrolmentPath(userId),
      confirmLink: confirmPath(userId),
      csrfToken: crypto.randomUUID(),
      selectedRelationshipId: crypto.randomUUID(),
      relationships
    })
  }
}

export {
  showAddRelationshipController,
  showRelationshipListController,
  addRelationshipController
}
