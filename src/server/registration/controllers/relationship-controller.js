import * as crypto from 'crypto'
import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { relationshipValidation } from '~/src/server/registration/helpers/schemas/relationship-validation.js'
import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import { updateRegistration } from '~/src/server/registration/helpers/update-registration.js'
import { removeRelationship } from '~/src/server/registration/helpers/remove-relationship.js'
import {
  findRelationship,
  findNonCurrentRelationships
} from '~/src/server/registration/helpers/find-relationships.js'
import {
  newRelationship,
  storeRelationship
} from '~/src/server/registration/helpers/new-relationship.js'
import { transformRelationships } from '~/src/server/registration/transformers/relationship-transformer.js'

const oidcBasePath = config.get('oidc.basePath')

function registrationPath(userId) {
  return `${oidcBasePath}/register/${userId}`
}

function relationshipPath(userId) {
  return `${oidcBasePath}/register/${userId}/relationship`
}

function summaryPath(userId) {
  return `${oidcBasePath}/register/${userId}/summary`
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
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const validationResult = relationshipValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      request.logger.warn(validationResult?.error, 'Payload error')
      const errorDetails = buildErrorDetails(validationResult.error.details)

      request.yar.flash('validationFailure', {
        formValues: payload,
        formErrors: errorDetails
      })
      return h.redirect(relationshipPath(userId))
    }

    const { relationshipId } = payload
    const relationship = await newRelationship(
      userId,
      relationshipId,
      request.registrations
    )
    relationship.organisationId = payload.organisationId
    relationship.organisationName = payload.organisationName
    relationship.relationshipRole = payload.relationshipRole
    await storeRelationship(
      userId,
      relationshipId,
      relationship,
      request.registrations
    )
    if (!registration.currentRelationshipId) {
      registration.currentRelationshipId = relationshipId
      await updateRegistration(userId, registration, request.registrations)
    }

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
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    let currentRelationship
    let currentRelationshipRows = []
    let relationshipsRows = []
    if (registration.currentRelationshipId) {
      currentRelationship = await findRelationship(
        userId,
        registration.currentRelationshipId,
        request.registrations
      )

      if (!currentRelationship) {
        request.logger.error({ userId }, 'Current relationship not found')
      }

      currentRelationshipRows = transformRelationships(
        [currentRelationship],
        currentRelationship
      )[0]
      const otherRelationships = await findNonCurrentRelationships(
        userId,
        registration.currentRelationshipId,
        request.registrations
      )

      relationshipsRows = transformRelationships(otherRelationships)
    }

    return h.view('registration/views/relationships-list', {
      pageTitle: 'DEFRA ID Relationships Setup',
      heading: 'DEFRA ID Relationships Setup',
      action: relationshipPath(userId),
      userId,
      goBackLink: registrationPath(userId),
      summaryLink: summaryPath(userId),
      csrfToken: crypto.randomUUID(),
      currentRelationship: currentRelationshipRows,
      relationships: relationshipsRows
    })
  }
}

const removeRelationshipController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required(),
        relationshipId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const { userId, relationshipId } = request.params

    const registration = await findRegistration(userId, request.registrations)

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found ')
      return h.redirect(oidcBasePath)
    }

    const relationship = await findRelationship(
      userId,
      relationshipId,
      request.registrations
    )

    if (!relationship) {
      request.logger.error({ userId, relationshipId }, 'Relationship not found')
      return h.redirect(relationshipPath(userId))
    }

    if (
      registration.currentRelationshipId &&
      registration.currentRelationshipId === relationshipId
    ) {
      const otherRelationships = await findNonCurrentRelationships(
        userId,
        registration.currentRelationshipId,
        request.registrations
      )
      if (otherRelationships.length > 0) {
        registration.currentRelationshipId =
          otherRelationships[0].relationshipId
      } else {
        delete registration.currentRelationshipId
      }
      await updateRegistration(userId, registration, request.registrations)
    }

    await removeRelationship(userId, relationshipId, request.registrations)

    request.logger.info({ relationshipId }, 'Relationship removed')

    return h.redirect(relationshipPath(userId))
  }
}

const makeCurrentRelationshipController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required(),
        relationshipId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const { userId, relationshipId } = request.params

    const registration = await findRegistration(userId, request.registrations)

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found ')
      return h.redirect(oidcBasePath)
    }

    const relationship = await findRelationship(
      userId,
      relationshipId,
      request.registrations
    )

    if (!relationship) {
      request.logger.error({ userId, relationshipId }, 'Relationship not found')
      return h.redirect(relationshipPath(userId))
    }

    registration.currentRelationshipId = relationshipId

    await updateRegistration(userId, registration, request.registrations)

    request.logger.info(
      { userId, relationshipId },
      'Relationship set as current'
    )

    return h.redirect(relationshipPath(userId))
  }
}

export {
  showRelationshipListController,
  addRelationshipController,
  makeCurrentRelationshipController,
  removeRelationshipController
}
