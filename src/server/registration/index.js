import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'
import {
  showRegistrationController,
  registrationController,
  showExistingRegistrationController,
  updateRegistrationController
} from '~/src/server/registration/controllers/registration-controller.js'
import { summaryRegistrationController } from '~/src/server/registration/controllers/summary-controller.js'
import {
  showRelationshipListController,
  addRelationshipController,
  removeRelationshipController
} from '~/src/server/registration/controllers/relationship-controller.js'

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
          ...removeRelationshipController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/register/{userId}/summary`,
          ...summaryRegistrationController
        }
      ])
    }
  }
}

export { registration }
