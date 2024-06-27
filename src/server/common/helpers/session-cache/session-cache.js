import yar from '@hapi/yar'

import { config } from '~/src/config/index.js'

const sessionConfig = config.get('session')

// Set options.maxCookieSize to 0 to always use server-side storage
const sessionCache = {
  plugin: yar,
  options: {
    name: sessionConfig.cache.name,
    cache: {
      cache: sessionConfig.cache.name,
      expiresIn: sessionConfig.cache.ttl
    },
    storeBlank: false,
    errorOnCacheNotReady: true,
    cookieOptions: {
      password: sessionConfig.cookie.password,
      ttl: sessionConfig.cookie.ttl,
      isSecure: config.get('isProduction')
    }
  }
}

export { sessionCache }
