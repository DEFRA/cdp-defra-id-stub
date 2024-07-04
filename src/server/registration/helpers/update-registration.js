import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'

async function updateRegistration(userId, registration, cache) {
  await cache.set(cacheKeys.registration(userId), registration)
}

export { updateRegistration }
