async function updateRegistration(userId, registration, cache) {
  await cache.set(`registration:${userId}`, registration)
}

export { updateRegistration }
