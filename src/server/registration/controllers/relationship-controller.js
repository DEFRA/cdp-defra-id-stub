import * as crypto from 'crypto'
import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { relationshipValidation } from '~/src/server/registration/helpers/schemas/relationship-validation.js'
import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import {
  findRelationship,
  findRelationships
} from '~/src/server/registration/helpers/find-relationships.js'
import {
  newRelationship,
  storeRelationship
} from '~/src/server/registration/helpers/new-relationship.js'
import { transformRelationships } from '~/src/server/registration/transformers/relationship-transformer.js'
import { updateRegistration } from '~/src/server/registration/helpers/update-registration.js'

const oidcBasePath = config.get('oidc.basePath')

function enrolmentPath(userId) {
  return `${oidcBasePath}/${userId}/enrolment`
}

function relationshipPath(userId) {
  return `${oidcBasePath}/${userId}/relationship`
}

function confirmPath(userId) {
  return `${oidcBasePath}/${userId}/confirm`
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
    if (!registration.currentRelationship) {
      registration.currentRelationship = relationshipid
      await updateRegistration(userId, registration, request.registrations)
    }

    request.logger.info({ relationship }, '====== Add relationships =======')

    return h.redirect(relationshipPath(userId))
  }
}

const showRelationshipListController = {
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

    request.logger.info('====== Show relationships list =======')

    const relationships = await findRelationships(userId, request.registrations)

    let currentRelationship
    let currentRelationshipRows = []
    let relationshipsRows = []
    if (registration.currentRelationship) {
      currentRelationship = await findRelationship(
        userId,
        registration.currentRelationship,
        request.registrations
      )

      if (!currentRelationship) {
        request.logger.error(
          { userId },
          '====== Current relationship not found ======'
        )
      }
      request.logger.info(
        { currentRelationship },
        '====== Current relationship found ======='
      )
      currentRelationshipRows = transformRelationships(
        [currentRelationship],
        currentRelationship
      )[0]
      const otherRelationships = relationships.filter(
        (relationship) =>
          relationship.relationshipId !== currentRelationship.relationshipId
      )
      relationshipsRows = transformRelationships(otherRelationships)
      request.logger.info(
        {
          otherRelationships
        },
        '====== Other relationships found ======='
      )
    }

    return h.view('registration/views/relationships-list', {
      pageTitle: 'DEFRA ID Relationships Setup',
      heading: 'DEFRA ID Relationships Setup',
      action: relationshipPath(userId),
      userId,
      enrolmentLink: enrolmentPath(userId),
      confirmLink: confirmPath(userId),
      csrfToken: crypto.randomUUID(),
      selectedRelationshipId: crypto.randomUUID(),
      relationshipId: crypto.randomUUID(),
      organisationId: crypto.randomUUID(),
      organisationName: 'DEFRA Example Organisation',
      currentRelationship: currentRelationshipRows,
      relationships: relationshipsRows
    })
  }
}

export { showRelationshipListController, addRelationshipController }