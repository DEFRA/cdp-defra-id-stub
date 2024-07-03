import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'
import {
  showRegistrationController,
  registrationController
} from '~/src/server/registration/controllers/registration-controller.js'
import {
  showEnrolmentController,
  setupEnrolmentController
} from '~/src/server/registration/controllers/enrolment-controller.js'
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
          method: 'POST',
          path: `${oidcBasePath}/setup`,
          ...registrationController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/{userId}/enrolment`,
          ...showEnrolmentController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/{userId}/enrolment`,
          ...setupEnrolmentController
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
        }
      ])
    }
  }
}

export { registration }
