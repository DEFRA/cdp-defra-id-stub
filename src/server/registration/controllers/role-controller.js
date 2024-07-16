import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { findRegistration } from '~/src/server/registration/helpers/find-registration.js'
import { findRelationship } from '~/src/server/registration/helpers/find-relationships.js'
import { updateRelationship } from '~/src/server/registration/helpers/update-relationship.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { roleNameValidation } from '~/src/server/registration/helpers/schemas/role-name-validation.js'

const oidcBasePath = config.get('oidc.basePath')

function registrationPath(userId) {
  return `${oidcBasePath}/register/${userId}`
}

function relationshipPath(userId) {
  return `${oidcBasePath}/register/${userId}/relationship`
}

function roleNamePath(userId, relationshipId) {
  return `${oidcBasePath}/register/${userId}/relationship/${relationshipId}/role-name`
}

const addRoleNameController = {
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
      return h.redirect(registrationPath(userId))
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
      return h.redirect(roleNamePath(userId))
    }

    relationship.roleName = payload.roleName
    relationship.roleStatus = payload.roleStatus

    await updateRelationship(
      userId,
      relationshipId,
      relationship,
      request.registrations
    )

    return h.redirect(relationshipPath(userId))
  }
}

const removeRoleNameController = {
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
      return h.redirect(registrationPath(userId))
    }

    delete relationship.roleName
    delete relationship.roleStatus

    await updateRelationship(
      userId,
      relationshipId,
      relationship,
      request.registrations
    )

    return h.redirect(relationshipPath(userId))
  }
}

const showAddRoleNameController = {
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
      return h.redirect(registrationPath(userId))
    }

    return h.view('registration/views/relationship-role', {
      title: 'Role Name',
      csrfToken: crypto.randomUUID(),
      userId,
      relationshipId,
      action: roleNamePath(userId, relationshipId),
      relationshipLink: relationshipPath(userId)
    })
  }
}

export {
  addRoleNameController,
  removeRoleNameController,
  showAddRoleNameController
}
