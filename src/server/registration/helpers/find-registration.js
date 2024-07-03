async function findRegistration(userId, cache) {
  return cache.get(`registration:${userId}`)
}

export { findRegistration }
