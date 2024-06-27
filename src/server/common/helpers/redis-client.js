import IoRedis from 'ioredis'

import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

/**
 * Setup Redis and provide a redis client
 *
 * Local development - 1 Redis instance
 * Environments - Elasticache / Redis Cluster with username and password
 *
 * @returns {Cluster | Redis}
 */
function buildRedisClient() {
  const logger = createLogger()
  const port = 6379
  const db = 0
  const redisConfig = config.get('redis')
  const keyPrefix = redisConfig.keyPrefix
  const host = redisConfig.host
  let redisClient

  if (redisConfig.enabled) {
    if (redisConfig.useSingleInstanceCache) {
      redisClient = new IoRedis({
        port,
        host,
        db,
        keyPrefix
      })
    } else {
      redisClient = new IoRedis.Cluster(
        [
          {
            host,
            port
          }
        ],
        {
          keyPrefix,
          slotsRefreshTimeout: 10000,
          dnsLookup: (address, callback) => callback(null, address),
          redisOptions: {
            username: redisConfig.username,
            password: redisConfig.password,
            db,
            tls: {}
          }
        }
      )
    }

    redisClient.on('connect', () => {
      logger.info('Connected to Redis server')
    })

    redisClient.on('error', (error) => {
      logger.error(`Redis connection error ${error}`)
    })
  } else {
    throw new Error(
      'Before you enable Redis, contact the CDP platform team as we need to set up config so you can run Redis in CDP environments'
    )
  }

  return redisClient
}

export { buildRedisClient }
