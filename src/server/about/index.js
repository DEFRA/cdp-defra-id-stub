import { aboutController } from '~/src/server/about/controller.js'

/**
 * Sets up the routes used in the /about page.
 * These routes are registered in src/server/router.js.
 */
const about = {
  plugin: {
    name: 'about',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/about',
          ...aboutController
        }
      ])
    }
  }
}

export { about }
