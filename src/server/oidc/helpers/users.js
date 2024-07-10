import {
  findRegistrations,
  findRegistrationByEmail
} from '~/src/server/registration/helpers/find-registration.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()

async function findAllUsers(cache) {
  const registrations = await findRegistrations(cache)
  logger.info({ registrations }, 'Found registrations')
  const users = registrations.map((registration) => {
    return {
      username: registration.email,
      email: registration.email,
      id: registration.userId
    }
  })
  return users
}

async function findUser(user, cache) {
  const registration = await findRegistrationByEmail(user, cache)
  if (registration) {
    return registration
  }
}

async function findUserEmail(id) {
  const user = await findUser(id)
  if (user?.email) {
    return user.email
  }
  return null
}

export { findAllUsers, findUser, findUserEmail }
