import { oidcBasePath } from '#server/oidc/oidc-config.js'
import {
  showRegistrationController,
  registrationController,
  showExistingRegistrationController,
  updateRegistrationController
} from '#server/registration/controllers/registration-controller.js'
import { summaryRegistrationController } from '#server/registration/controllers/summary-controller.js'
import {
  showRelationshipListController,
  addRelationshipController,
  makeCurrentRelationshipController,
  removeRelationshipController
} from '#server/registration/controllers/relationship-controller.js'
import { expireRegistrationApiController } from '#server/registration/controllers/expire-registration-api-controller.js'
import { expireRegistrationController } from '#server/registration/controllers/expire-registration-controller.js'
import { findRegistrationApiController } from '#server/registration/controllers/find-registration-api-controller.js'
import { registerApiController } from '#server/registration/controllers/register-api-controller.js'
import {
  addRoleNameController,
  removeRoleNameController,
  showAddRoleNameController
} from '#server/registration/controllers/role-controller.js'

const registration = {
  plugin: {
    name: 'registration',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: `${oidcBasePath}/register`,
          ...showRegistrationController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/register/{userId}`,
          ...showExistingRegistrationController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/register`,
          ...registrationController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/register/{userId}/update`,
          ...updateRegistrationController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/register/{userId}/relationship`,
          ...showRelationshipListController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/register/{userId}/relationship`,
          ...addRelationshipController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/register/{userId}/relationship/{relationshipId}/remove`,
          ...removeRelationshipController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/register/{userId}/relationship/{relationshipId}/current`,
          ...makeCurrentRelationshipController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/register/{userId}/relationship/{relationshipId}/role-name`,
          ...showAddRoleNameController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/register/{userId}/relationship/{relationshipId}/role-name`,
          ...addRoleNameController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/register/{userId}/relationship/{relationshipId}/role-name/remove`,
          ...removeRoleNameController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/register/{userId}/summary`,
          ...summaryRegistrationController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/API/register/{userId}`,
          ...findRegistrationApiController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/API/register`,
          ...registerApiController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/API/register/{userId}/expire`,
          ...expireRegistrationApiController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/register/{userId}/expire`,
          ...expireRegistrationController
        }
      ])
    }
  }
}

export { registration }
