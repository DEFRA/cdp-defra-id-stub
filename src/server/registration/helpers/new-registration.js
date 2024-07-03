import { addToCachedArray } from '~/src/server/common/helpers/add-to-cached-array.js'

async function addRegistrationId(id, cache) {
  await addToCachedArray('registration-ids', id, cache)
}

async function storeRegistration(id, registration, cache) {
  await cache.set(`registration:${id}`, registration)
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
