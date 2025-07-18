import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '~/src/config/index.js'
import { nunjucksConfig } from '~/src/config/nunjucks/index.js'
import { router } from './router.js'
import { requestLogger } from '~/src/server/common/helpers/logging/request-logger.js'
import { catchAll } from '~/src/server/common/helpers/errors.js'
import { secureContext } from '~/src/server/common/helpers/secure-context/index.js'
import { sessionCache } from '~/src/server/common/helpers/session-cache/session-cache.js'
import { getCacheEngine } from '~/src/server/common/helpers/session-cache/cache-engine.js'
import { addFlashMessagesToContext } from '~/src/server/common/helpers/add-flash-messages-to-context.js'

const isProduction = config.get('isProduction')

async function createServer() {
  const cacheEngine = getCacheEngine(config.get('session.cache.engine'))
  const server = hapi.server({
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    },
    cache: [
      {
        name: config.get('session.cache.name'),
        engine: cacheEngine
      },
      {
        name: 'registrations',
        engine: cacheEngine
      }
    ]
  })

  await server.register(requestLogger)

  if (isProduction) {
    await server.register(secureContext)
  }

  const registrations = server.cache({
    cache: 'registrations',
    segment: 'registration',
    expiresIn: 3 * 24 * 60 * 60 * 1000
  })

  server.decorate('request', 'registrations', registrations)
  server.decorate('server', 'registrations', registrations)

  await server.register([sessionCache, nunjucksConfig])

  // Register all of the controllers/routes defined in src/server/router.js
  await server.register([router])

  server.ext('onPreResponse', addFlashMessagesToContext, {
    before: ['yar']
  })
  server.ext('onPreResponse', catchAll)

  return server
}

export { createServer }
