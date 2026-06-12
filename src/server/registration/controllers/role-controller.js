import * as crypto from 'crypto'
import Joi from 'joi'

import { findRegistration } from '#server/registration/helpers/find-registration.js'
import { findRelationship } from '#server/registration/helpers/find-relationships.js'
import { updateRelationship } from '#server/registration/helpers/update-relationship.js'
import { roleNameValidation } from '#server/registration/helpers/schemas/role-name-validation.js'
import {
  relationshipPath,
  registrationPath,
  roleNamePath
} from '#server/registration/helpers/registration-paths.js'
import {
  flashValidationFailure,
  readValidationFailure
} from '#server/registration/helpers/validation-failure.js'
import { oidcBasePath } from '#server/oidc/oidc-config.js'

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

    const registration = await findRegistration(
      userId,
      request.registrationsStore
    )

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const relationship = await findRelationship(
      userId,
      relationshipId,
      request.registrationsStore
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
      flashValidationFailure(request, payload, validationResult.error)
      return h.redirect(
        roleNamePath(userId, relationshipId, payload?.redirect_uri)
      )
    }

    relationship.roleName = payload.roleName
    relationship.roleStatus = payload.roleStatus

    await updateRelationship(
      userId,
      relationshipId,
      relationship,
      request.registrationsStore
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

    const registration = await findRegistration(
      userId,
      request.registrationsStore
    )

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const relationship = await findRelationship(
      userId,
      relationshipId,
      request.registrationsStore
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
      request.registrationsStore
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
    const { formValues, formErrors } = readValidationFailure(request)

    const registration = await findRegistration(
      userId,
      request.registrationsStore
    )

    if (!registration) {
      request.logger.error({ userId }, 'Registration not found')
      return h.redirect(oidcBasePath)
    }

    const relationship = await findRelationship(
      userId,
      relationshipId,
      request.registrationsStore
    )

    if (!relationship) {
      request.logger.error({ userId, relationshipId }, 'Relationship not found')
      return h.redirect(registrationPath(userId, redirectUri))
    }

    return h.view('registration/views/relationship-role', {
      title: 'Role Name',
      heading: 'Role Name',
      csrfToken: formValues.csrfToken ?? crypto.randomUUID(),
      userId,
      relationshipId,
      roleName: formValues.roleName,
      roleStatus: formValues.roleStatus,
      action: roleNamePath(userId, relationshipId, redirectUri),
      relationshipLink: relationshipPath(userId, redirectUri),
      redirectUri,
      formErrors
    })
  }
}

export {
  addRoleNameController,
  removeRoleNameController,
  showAddRoleNameController
}
