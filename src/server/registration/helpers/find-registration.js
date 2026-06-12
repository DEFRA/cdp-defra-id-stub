async function findRegistration(userId, store) {
  return store.getRegistration(userId)
}

async function findRegistrations(store) {
  return store.listRegistrations()
}

async function findRegistrationByEmail(email, store) {
  return store.findRegistrationByEmail(email)
}

export { findRegistration, findRegistrationByEmail, findRegistrations }
