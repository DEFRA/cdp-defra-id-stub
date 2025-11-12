import { config } from '~/src/config/index.js'
import {
  authorizeController,
  loginController
} from '~/src/server/oidc/controllers/authorize-controller.js'
import { logoutController } from '~/src/server/oidc/controllers/logout-controller.js'
import {
  selectOrganisationController,
  showOrganisationPickerController
} from '~/src/server/oidc/controllers/organisation-controller.js'
import { tokenController } from '~/src/server/oidc/controllers/token-controller.js'
import { userInfoController } from '~/src/server/oidc/controllers/user-info-controller.js'
import { jwksController } from '~/src/server/oidc/controllers/well-known-jwks.js'
import { openIdConfigurationController } from '~/src/server/oidc/controllers/well-known-openid-configuration.js'
import {
  generateRandomKeypair,
  loadKeyPair
} from '~/src/server/oidc/helpers/oidc-crypto.js'
import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'

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
          method: 'GET',
          path: `${oidcBasePath}/login`,
          ...loginController
        },
        {
          method: 'GET',
          path: `${oidcBasePath}/organisations`,
          ...showOrganisationPickerController
        },
        {
          method: 'POST',
          path: `${oidcBasePath}/organisations`,
          ...selectOrganisationController
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
