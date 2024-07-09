async function addToCachedArray(key, value, cache) {
  const ids = (await cache.get(key)) ?? []
  ids.push(value)
  await cache.set(key, ids)
}

export { addToCachedArray }
