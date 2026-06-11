import inert from '@hapi/inert'

import { health } from '#server/health/index.js'
import { home } from '#server/home/index.js'
import { serveStaticFiles } from '#server/common/helpers/serve-static-files.js'
import { about } from '#server/about/index.js'
import { oidc } from '#server/oidc/index.js'
import { registration } from '#server/registration/index.js'

const router = {
  plugin: {
    name: 'router',
    register: async (server) => {
      await server.register([inert])

      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Application specific routes, add your own routes here
      await server.register([home, about, oidc, registration])

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}

export { router }
