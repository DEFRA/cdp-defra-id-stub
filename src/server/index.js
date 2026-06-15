import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '#config/index.js'
import { nunjucksConfig } from '#config/nunjucks/index.js'
import { router } from './router.js'
import { requestTracing } from '#server/common/helpers/request-tracing.js'
import { pulse } from '#server/common/helpers/pulse.js'
import { requestLogger } from '#server/common/helpers/logging/request-logger.js'
import { catchAll } from '#server/common/helpers/errors.js'
import { secureContext } from '@defra/hapi-secure-context'
import { sessionCache } from '#server/common/helpers/session-cache/session-cache.js'
import { getCacheEngine } from '#server/common/helpers/session-cache/cache-engine.js'
import { addFlashMessagesToContext } from '#server/common/helpers/add-flash-messages-to-context.js'
import { createRegistrationsStore } from '#server/registration/store/index.js'

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
      }
    ]
  })

  await server.register([requestLogger, requestTracing, secureContext, pulse])

  const registrationsStore = createRegistrationsStore(config)

  server.decorate('request', 'registrationsStore', registrationsStore)
  server.decorate('server', 'registrationsStore', registrationsStore)

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
