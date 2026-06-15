async function updateRegistration(userId, registration, store) {
  await store.putRegistration(userId, registration)
}

export { updateRegistration }
