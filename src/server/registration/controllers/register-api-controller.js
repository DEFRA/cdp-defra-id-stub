import * as crypto from 'crypto'

import { asyncMap } from '~/src/server/common/helpers/async-map.js'
import {
  findRegistration,
  findRegistrationByEmail
} from '~/src/server/registration/helpers/find-registration.js'
import { fullRegistrationValidation } from '~/src/server/registration/helpers/schemas/full-registration-validation.js'
import { removeRegistration } from '~/src/server/registration/helpers/remove-registration.js'
import {
  newRegistration,
  storeRegistration
} from '~/src/server/registration/helpers/new-registration.js'
import { updateRegistration } from '~/src/server/registration/helpers/update-registration.js'
import {
  newRelationship,
  storeRelationship
} from '~/src/server/registration/helpers/new-relationship.js'
import { findRelationship } from '~/src/server/registration/helpers/find-relationships.js'
import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'

const registerApiController = {
  handler: async (request, h) => {
    try {
      const payload = request?.payload

      const validationResult = fullRegistrationValidation.validate(payload, {
        abortEarly: false
      })

      if (validationResult?.error) {
        request.logger.warn(validationResult?.error, 'Payload error')
        const response = {
          message: 'Invalid payload'
        }
        return h.response(response).code(400)
      }

      request.logger.info({ payload }, 'payload')

      let userId = payload.userId

      if (userId) {
        const regWithId = await findRegistration(userId, request.registrations)

        if (regWithId) {
          request.logger.info(
            { userId },
            'Registration with User ID already present. Removing'
          )
          removeRegistration(regWithId.userId, request.registrations)
        }
      } else {
        userId = crypto.randomUUID()
      }

      const { email } = payload

      const regWithEmail = await findRegistrationByEmail(
        email,
        request.registrations
      )

      if (regWithEmail) {
        request.logger.info(
          { userId: regWithEmail.userId },
          'Registration with email exists. Removing'
        )

        if (userId !== regWithEmail.userId) {
          removeRegistration(regWithEmail.userId, request.registrations)
        }
      }

      const registration = await createRegistration(
        userId,
        payload,
        request.registrations
      )

      const relationships = await addRelationships(
        userId,
        payload.relationships,
        request.registrations
      )

      await updateCurrentRelationship(
        userId,
        registration,
        relationships,
        request.registrations
      )

      const response = {
        userId,
        email,
        links: [
          {
            rel: 'self',
            href: `${oidcBasePath}/API/register/${userId}`
          },
          {
            rel: 'expire',
            href: `${oidcBasePath}/API/register/${userId}/expire`
          }
        ]
      }
      return h
        .response(response)
        .code(201)
        .header('Location', `${oidcBasePath}/API/register/${userId}`)
    } catch (error) {
      request.logger.error('Error registering user: ' + error)
      const response = {
        message: 'System error'
      }
      return h.response(response).code(500)
    }
  }
}

async function createRegistration(userId, payload, cache) {
  const registration = await newRegistration(userId, cache)
  registration.contactId = payload.contactId ?? crypto.randomUUID()
  registration.email = payload.email
  registration.firstName = payload.firstName
  registration.lastName = payload.lastName
  registration.uniqueReference = payload.uniqueReference ?? crypto.randomUUID()
  registration.loa = payload.loa
  registration.aal = payload.aal
  registration.enrolmentCount = payload.enrolmentCount
  registration.enrolmentRequestCount = payload.enrolmentRequestCount
  await storeRegistration(userId, registration, cache)
  return registration
}

async function addRelationships(userId, payload, cache) {
  if (!payload?.length) {
    return []
  }
  const relationships = await asyncMap(payload, async (relationship) => {
    return await addRelationship(userId, relationship, cache)
  })
  return relationships
}

async function addRelationship(userId, payload, cache) {
  const relationshipId = payload.relationshipId ?? crypto.randomUUID()
  const relationship = await newRelationship(userId, relationshipId, cache)
  relationship.organisationId = payload.relationshipId ?? crypto.randomUUID()
  relationship.organisationName = payload.organisationName
  relationship.relationshipRole = payload.relationshipRole
  relationship.roleName = payload.roleName
  relationship.roleStatus = payload.roleStatus
  await storeRelationship(userId, relationshipId, relationship, cache)
  return relationship
}

async function findCurrentRelationshipId(userId, relationships, cache) {
  let currentRelationshipId = relationships[0].relationshipId
  if (relationships.currentRelationshipId) {
    const currentRelationship = await findRelationship(
      userId,
      relationships.currentRelationshipId,
      cache
    )
    if (currentRelationship) {
      currentRelationshipId = currentRelationship.relationshipId
    }
  }
  return currentRelationshipId
}

async function updateCurrentRelationship(
  userId,
  registration,
  relationships,
  cache
) {
  if (relationships.length) {
    const currentRelationshipId = await findCurrentRelationshipId(
      userId,
      relationships,
      cache
    )
    registration.currentRelationshipId = currentRelationshipId
    await updateRegistration(userId, registration, cache)
  }
  return registration
}

export { registerApiController }
