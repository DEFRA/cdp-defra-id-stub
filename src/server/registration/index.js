import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'
import {
  showRegistrationController,
  registrationController,
  showExistingRegistrationController,
  updateRegistrationController,
  summaryRegistrationController
} from '~/src/server/registration/controllers/registration-controller.js'
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
          path: `${oidcBasePath}`,
          ...showRegistrationController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/{userId}`,
          ...showExistingRegistrationController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/setup`,
          ...registrationController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/{userId}/update`,
          ...updateRegistrationController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/{userId}/relationship`,
          ...showRelationshipListController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/{userId}/relationship`,
          ...addRelationshipController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/{userId}/relationship/{relationshipId}/remove`,
          ...removeRelationshipController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/{userId}/summary`,
          ...summaryRegistrationController
        }
      ])
    }
  }
}

export { registration }
