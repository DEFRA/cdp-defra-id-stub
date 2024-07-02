import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'
import {
  showSetupDetailsController,
  setupDetailsController,
  showSetupEnrolmentController,
  setupEnrolmentController
} from '~/src/server/registration/controllers/setup-controller.js'
import {
  showAddRelationshipController,
  showRelationshipListController,
  addRelationshipController
} from '~/src/server/registration/controllers/relationship-controller.js'

const registration = {
  plugin: {
    name: 'registration',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: `${oidcBasePath}`,
          ...showSetupDetailsController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/setup`,
          ...setupDetailsController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/{userId}/enrolment`,
          ...showSetupEnrolmentController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/{userId}/enrolment`,
          ...setupEnrolmentController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/{userId}/relationship`,
          ...showAddRelationshipController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/{userId}/relationship/{relationshipId}`,
          ...showRelationshipListController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/{userId}/relationship`,
          ...addRelationshipController
        }
      ])
    }
  }
}

export { registration }
