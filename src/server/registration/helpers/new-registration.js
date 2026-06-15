import { createLogger } from '#server/common/helpers/logging/logger.js'

const logger = createLogger()

async function storeRegistration(id, registration, store) {
  await store.putRegistration(id, registration)
  logger.info(`storing registration ${id}`)
  return registration
}

async function newRegistration(userId) {
  const registration = {
    userId,
    created: new Date()
  }
  return registration
}

export { newRegistration, storeRegistration }
