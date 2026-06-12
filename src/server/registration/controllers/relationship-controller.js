import * as crypto from 'crypto'
import Joi from 'joi'

import { relationshipValidation } from '#server/registration/helpers/schemas/relationship-validation.js'
import {
  buildFormErrorSummary,
  flashValidationFailure,
  readValidationFailure
} from '#server/registration/helpers/validation-failure.js'
import { findRegistration } from '#server/registration/helpers/find-registration.js'
import { updateRegistration } from '#server/registration/helpers/update-registration.js'
import { removeRelationship } from '#server/registration/helpers/remove-relationship.js'
import {
  findRelationship,
  findNonCurrentRelationships
} from '#server/registration/helpers/find-relationships.js'
import {
  newRelationship,
  storeRelationship
} from '#server/registration/helpers/new-relationship.js'
import { transformRelationships } from '#server/registration/transformers/relationship-transformer.js'
import { redirectSearchParam } from '#server/registration/helpers/include-redirect.js'
import {
  relationshipPath,
  registrationPath,
  summaryPath
} from '#server/registration/helpers/registration-paths.js'
import { oidcBasePath } from '#server/oidc/oidc-config.js'

function relationshipRoleItems(selectedRole = 'Employee') {
  return ['Agent', 'Employee', 'Citizen'].map((value) => ({
    value,
    text: value,
    checked: value === selectedRole
  }))
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

    const registration = await findRegistration(
      userId,
      request.registrationsStore
    )

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const validationResult = relationshipValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      request.logger.warn(validationResult?.error, 'Payload error')
      flashValidationFailure(request, payload, validationResult.error)
      return h.redirect(relationshipPath(userId, payload.redirect_uri))
    }

    const { relationshipId } = payload
    const relationship = await newRelationship(userId, relationshipId)
    relationship.organisationId = payload.organisationId
    relationship.organisationName = payload.organisationName
    relationship.relationshipRole = payload.relationshipRole
    await storeRelationship(
      userId,
      relationshipId,
      relationship,
      request.registrationsStore
    )
    if (!registration.currentRelationshipId) {
      registration.currentRelationshipId = relationshipId
      await updateRegistration(userId, registration, request.registrationsStore)
    }

    return h.redirect(relationshipPath(userId, payload.redirect_uri))
  }
}

const showRelationshipListController = {
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
    const { formValues, formErrors } = readValidationFailure(request)

    const registration = await findRegistration(
      userId,
      request.registrationsStore
    )

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
        request.registrationsStore
      )

      if (!currentRelationship) {
        request.logger.error({ userId }, 'Current relationship not found')
      }

      const queryString = redirectSearchParam(redirectUri)

      currentRelationshipRows = transformRelationships(
        [currentRelationship],
        currentRelationship,
        queryString
      )[0]
      const otherRelationships = await findNonCurrentRelationships(
        userId,
        registration.currentRelationshipId,
        request.registrationsStore
      )

      relationshipsRows = transformRelationships(
        otherRelationships,
        null,
        queryString
      )
    }

    return h.view('registration/views/relationships-list', {
      pageTitle: 'DEFRA ID Relationships Setup',
      heading: 'DEFRA ID Relationships Setup',
      action: relationshipPath(userId),
      userId,
      goBackLink: registrationPath(userId, redirectUri),
      summaryLink: summaryPath(userId, redirectUri),
      csrfToken: formValues.csrfToken ?? crypto.randomUUID(),
      currentRelationship: currentRelationshipRows,
      relationships: relationshipsRows,
      redirectUri,
      relationshipId: formValues.relationshipId,
      organisationId: formValues.organisationId,
      organisationName: formValues.organisationName,
      relationshipRoleItems: relationshipRoleItems(
        formValues.relationshipRole ?? 'Employee'
      ),
      errorSummaryItems: buildFormErrorSummary(formErrors),
      formErrors
    })
  }
}

const removeRelationshipController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required(),
        relationshipId: Joi.string().required()
      }),
      query: Joi.object({
        redirect_uri: Joi.string().uri().optional()
      })
    }
  },
  handler: async (request, h) => {
    const { userId, relationshipId } = request.params

    const registration = await findRegistration(
      userId,
      request.registrationsStore
    )

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found ')
      return h.redirect(oidcBasePath)
    }

    const relationship = await findRelationship(
      userId,
      relationshipId,
      request.registrationsStore
    )

    if (!relationship) {
      request.logger.error({ userId, relationshipId }, 'Relationship not found')
      return h.redirect(relationshipPath(userId, request.query?.redirect_uri))
    }

    if (
      registration.currentRelationshipId &&
      registration.currentRelationshipId === relationshipId
    ) {
      const otherRelationships = await findNonCurrentRelationships(
        userId,
        registration.currentRelationshipId,
        request.registrationsStore
      )
      if (otherRelationships.length > 0) {
        registration.currentRelationshipId =
          otherRelationships[0].relationshipId
      } else {
        delete registration.currentRelationshipId
      }
      await updateRegistration(userId, registration, request.registrationsStore)
    }

    await removeRelationship(userId, relationshipId, request.registrationsStore)

    request.logger.info({ relationshipId }, 'Relationship removed')

    return h.redirect(relationshipPath(userId, request.query?.redirect_uri))
  }
}

const makeCurrentRelationshipController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required(),
        relationshipId: Joi.string().required()
      }),
      query: Joi.object({
        redirect_uri: Joi.string().uri().optional()
      })
    }
  },
  handler: async (request, h) => {
    const { userId, relationshipId } = request.params

    const registration = await findRegistration(
      userId,
      request.registrationsStore
    )

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found ')
      return h.redirect(oidcBasePath)
    }

    const relationship = await findRelationship(
      userId,
      relationshipId,
      request.registrationsStore
    )

    if (!relationship) {
      request.logger.error({ userId, relationshipId }, 'Relationship not found')
      return h.redirect(relationshipPath(userId, request.query?.redirect_uri))
    }

    registration.currentRelationshipId = relationshipId

    await updateRegistration(userId, registration, request.registrationsStore)

    request.logger.info(
      { userId, relationshipId },
      'Relationship set as current'
    )

    return h.redirect(relationshipPath(userId, request.query?.redirect_uri))
  }
}

export {
  showRelationshipListController,
  addRelationshipController,
  makeCurrentRelationshipController,
  removeRelationshipController
}
