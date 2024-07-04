import { addToCachedArray } from '~/src/server/common/helpers/add-to-cached-array.js'
import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'

async function addRegistrationId(id, cache) {
  await addToCachedArray(cacheKeys.registrationIds, id, cache)
}

async function storeRegistration(id, registration, cache) {
  await cache.set(cacheKeys.registration(id), registration)
  return registration
}

async function newRegistration(userId, cache) {
  const registration = {
    userId,
    created: new Date()
  }
  await addRegistrationId(userId, cache)
  return registration
}

export { newRegistration, storeRegistration }
