async function addToCachedArray(key, value, cache) {
  const ids = await cache.get(key)
  if (ids) {
    ids.push(value)
    await cache.set(key, ids)
  } else {
    await cache.set(key, [value])
  }
}

export { addToCachedArray }
