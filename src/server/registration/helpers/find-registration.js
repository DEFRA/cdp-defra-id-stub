import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'
import { asyncMap } from '~/src/server/common/helpers/async-map.js'

async function findRegistration(userId, cache) {
  return cache.get(cacheKeys.registration(userId))
}

async function findRegistrations(cache) {
  const allUserIds = await cache.get(cacheKeys.registrationIds)
  const registrations = await asyncMap(allUserIds, (id) =>
    findRegistration(id, cache)
  )
  return registrations
}

async function findRegistrationByEmail(email, cache) {
  const registrations = await findRegistrations(cache)
  return registrations.find((registration) => registration.email === email)
}

export { findRegistration, findRegistrationByEmail, findRegistrations }
