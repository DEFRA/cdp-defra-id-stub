import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'
import { asyncMap } from '~/src/server/common/helpers/async-map.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()

async function findRegistration(userId, cache) {
  return cache.get(cacheKeys.registration(userId))
}

async function findRegistrations(cache) {
  const allUserIds = (await cache.get(cacheKeys.registrationIds)) ?? []
  const registrations = await asyncMap(allUserIds, async (id) => {
    const reg = await findRegistration(id, cache)
    if (!reg) {
      logger.error(
        `Registration not found: [${id}], but in registration-ids list`
      )
    }
    return reg
  })
  return registrations.filter((r) => r)
}

async function findRegistrationByEmail(email, cache) {
  const registrations = await findRegistrations(cache)
  return registrations.find((registration) => registration.email === email)
}

export { findRegistration, findRegistrationByEmail, findRegistrations }
