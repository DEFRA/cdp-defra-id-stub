import { healthController } from '#server/health/controller.js'

const health = {
  plugin: {
    name: 'health',
    register: async (server) => {
      server.route({
        method: 'GET',
        path: '/health',
        ...healthController
      })
    }
  }
}

export { health }
