async function asyncMap(arr, fun) {
  return await Promise.all(arr.map(async (v) => await fun(v)))
}

export { asyncMap }
