import {
  homeController,
  goHomeController
} from '~/src/server/home/controller.js'
import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'

const home = {
  plugin: {
    name: 'home',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...homeController
        },
        {
          method: 'GET',
          path: oidcBasePath,
          ...goHomeController
        }
      ])
    }
  }
}

export { home }
