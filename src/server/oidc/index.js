import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'
import { openIdConfigurationController } from '~/src/server/oidc/controllers/well-known-openid-configuration.js'
import { jwksController } from '~/src/server/oidc/controllers/well-known-jwks.js'
import { authorizeController } from '~/src/server/oidc/controllers/authorize-controller.js'
import { tokenController } from '~/src/server/oidc/controllers/token-controller.js'
import {
  generateRandomKeypair,
  loadKeyPair
} from '~/src/server/oidc/helpers/oidc-crypto.js'
import { userInfoController } from '~/src/server/oidc/controllers/user-info-controller.js'
import { config } from '~/src/config/index.js'
import { logoutController } from '~/src/server/oidc/controllers/logout-controller.js'
import {
  showSetupDetailsController,
  setupDetailsController,
  showSetupEnrolmentController,
  setupEnrolmentController
} from '~/src/server/oidc/controllers/setup-controller.js'
import {
  showAddRelationshipController,
  showRelationshipListController,
  addRelationshipController
} from '~/src/server/oidc/controllers/relationship-controller.js'

const oidc = {
  plugin: {
    name: 'oidc',
    register: async (server) => {
      const cfgPubKey = config.get('oidc.publicKeyBase64')
      const cfgPrivKey = config.get('oidc.privateKeyBase64')

      let keys
      if (cfgPubKey && cfgPrivKey) {
        server.logger.info('loading keys from config')
        keys = loadKeyPair(
          Buffer.from(cfgPubKey, 'base64'),
          Buffer.from(cfgPrivKey, 'base64')
        )
      } else {
        server.logger.info('generating random keys')
        keys = generateRandomKeypair()
      }
      server.decorate('server', 'keys', keys)
      server.decorate('request', 'keys', keys)

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
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/.well-known/openid-configuration`,
          ...openIdConfigurationController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/.well-known/jwks.json`,
          ...jwksController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/authorize`,
          ...authorizeController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/token`,
          ...tokenController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/user-info`,
          ...userInfoController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/logout`,
          ...logoutController
        }
      ])
    }
  }
}

export { oidc }
