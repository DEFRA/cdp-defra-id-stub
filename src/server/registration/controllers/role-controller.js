import Joi from 'joi'

import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import { findRelationship } from '~/src/server/registration/helpers/find-relationships.js'
import { updateRelationship } from '~/src/server/registration/helpers/update-relationship.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { roleNameValidation } from '~/src/server/registration/helpers/schemas/role-name-validation.js'
import {
  relationshipPath,
  registrationPath,
  roleNamePath
} from '~/src/server/registration/helpers/registration-paths.js'
import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'

const addRoleNameController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required(),
        relationshipId: Joi.string().required()
      }).unknown(true)
    }
  },
  handler: async (request, h) => {
    const { userId, relationshipId } = request.params
    const payload = request?.payload

    const registration = await findRegistration(userId, request.registrations)

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const relationship = await findRelationship(
      userId,
      relationshipId,
      request.registrations
    )

    if (!relationship) {
      request.logger.error({ userId, relationshipId }, 'Relationship not found')
      return h.redirect(registrationPath(userId, payload.redirect_uri))
    }

    const validationResult = roleNameValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      request.logger.warn(validationResult?.error, 'Payload error')
      const errorDetails = buildErrorDetails(validationResult.error.details)

      request.yar.flash('validationFailure', {
        formValues: payload,
        formErrors: errorDetails
      })
      return h.redirect(roleNamePath(userId, payload.redirect_uri))
    }

    relationship.roleName = payload.roleName
    relationship.roleStatus = payload.roleStatus

    await updateRelationship(
      userId,
      relationshipId,
      relationship,
      request.registrations
    )

    return h.redirect(relationshipPath(userId, payload.redirect_uri))
  }
}

const removeRoleNameController = {
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

    const registration = await findRegistration(userId, request.registrations)

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const relationship = await findRelationship(
      userId,
      relationshipId,
      request.registrations
    )

    if (!relationship) {
      request.logger.error({ userId, relationshipId }, 'Relationship not found')
      return h.redirect(registrationPath(userId, request.query?.redirect_uri))
    }

    delete relationship.roleName
    delete relationship.roleStatus

    await updateRelationship(
      userId,
      relationshipId,
      relationship,
      request.registrations
    )
    return h.redirect(relationshipPath(userId, request.query?.redirect_uri))
  }
}

const showAddRoleNameController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required(),
        relationshipId: Joi.string().required()
      }).unknown(true),
      query: Joi.object({
        redirect_uri: Joi.string().uri().optional()
      })
    }
  },
  handler: async (request, h) => {
    const { userId, relationshipId } = request.params
    const redirectUri = request.query?.redirect_uri

    const registration = await findRegistration(userId, request.registrations)

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const relationship = await findRelationship(
      userId,
      relationshipId,
      request.registrations
    )

    if (!relationship) {
      request.logger.error({ userId, relationshipId }, 'Relationship not found')
      return h.redirect(registrationPath(userId, redirectUri))
    }

    return h.view('registration/views/relationship-role', {
      title: 'Role Name',
      csrfToken: crypto.randomUUID(),
      userId,
      relationshipId,
      action: roleNamePath(userId, relationshipId),
      relationshipLink: relationshipPath(userId, redirectUri),
      redirectUri
    })
  }
}

export {
  addRoleNameController,
  removeRoleNameController,
  showAddRoleNameController
}
