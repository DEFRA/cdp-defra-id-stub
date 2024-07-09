import { removeFromCachedArray } from '~/src/server/common/helpers/remove-from-cached-array.js'
import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'

async function removeRegistration(userId, cache) {
  await removeFromCachedArray(cacheKeys.registrationIds, userId, cache)
  await cache.drop(cacheKeys.registration(userId))
}

export { removeRegistration }
