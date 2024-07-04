async function removeFromCachedArray(key, value, cache) {
  const ids = await cache.get(key)
  if (ids) {
    const newIds = ids.filter((id) => id !== value)
    await cache.set(key, newIds)
  }
}

export { removeFromCachedArray }
