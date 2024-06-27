import { buildRedisClient } from '~/src/server/common/helpers/redis-client.js'
import { Engine as CatboxRedis } from '@hapi/catbox-redis'
import { Engine as CatboxMemory } from '@hapi/catbox-memory'

import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

function getCacheEngine() {
  const isProduction = config.get('isProduction')
  const logger = createLogger()

  const redisEnabled = config.get('redis.enabled')
  // If server side caching is required, including anything with yar (e.g. `request.yar.set`) then Redis
  // will need to be set up. Using Catbox Memory will result in intermittent caching failures as the server side
  // cache will be instance specific and not shared amongst instances.
  if (redisEnabled) {
    return new CatboxRedis({
      client: buildRedisClient()
    })
  } else if (isProduction) {
    logger.error('Catbox Memory used in production')
    return new CatboxMemory()
  } else {
    logger.warn(
      'Catbox Memory used for server side cache, this could cause issues if used in production - See README'
    )
    return new CatboxMemory()
  }
}
export { getCacheEngine }
