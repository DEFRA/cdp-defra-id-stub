import {
  findRegistrations,
  findRegistrationByEmail
} from '#server/registration/helpers/find-registration.js'
import { createLogger } from '#server/common/helpers/logging/logger.js'

const logger = createLogger()

async function findAllUsers(store) {
  const registrations = await findRegistrations(store)
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

async function findUser(user, store) {
  const registration = await findRegistrationByEmail(user, store)
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
