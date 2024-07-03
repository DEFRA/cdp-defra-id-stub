import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'

async function findRegistration(userId, cache) {
  return cache.get(cacheKeys.registration(userId))
}

export { findRegistration }
