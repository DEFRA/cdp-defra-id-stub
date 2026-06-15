async function removeRegistration(userId, store) {
  await store.deleteRegistration(userId)
}

export { removeRegistration }
