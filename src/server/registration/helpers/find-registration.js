import { cacheKeys } from '~/src/server/registration/helpers/cache-keys.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()

async function findRegistration(userId, cache) {
  return cache.get(cacheKeys.registration(userId))
}

async function findRegistrations(cache) {
  const allUserIds = (await cache.get(cacheKeys.registrationIds)) ?? []

  const registrations = []

  for (const id of allUserIds) {
    const reg = await findRegistration(id, cache)
    if (reg) {
      registrations.push(reg)
    }
  }

  if (registrations.length < allUserIds.length) {
    logger.error(
      `${allUserIds.length - registrations.length} registrations missing`
    )
  }

  return registrations.filter((r) => r)
}

async function findRegistrationByEmail(email, cache) {
  const registrations = await findRegistrations(cache)
  return registrations.find((registration) => registration.email === email)
}

export { findRegistration, findRegistrationByEmail, findRegistrations }
