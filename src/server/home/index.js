import { homeController } from '~/src/server/home/controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
const home = {
  plugin: {
    name: 'home',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...homeController
        }
      ])
    }
  }
}

export { home }
