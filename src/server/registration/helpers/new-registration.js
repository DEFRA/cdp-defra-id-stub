import { addToCachedArray } from '#server/common/helpers/add-to-cached-array.js'
import { cacheKeys } from '#server/registration/helpers/cache-keys.js'
import { createLogger } from '#server/common/helpers/logging/logger.js'

const logger = createLogger()

async function addRegistrationId(id, cache) {
  await addToCachedArray(cacheKeys.registrationIds, id, cache)
}

async function storeRegistration(id, registration, cache) {
  await cache.set(cacheKeys.registration(id), registration)
  logger.info(`storing registration ${id}`)
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
