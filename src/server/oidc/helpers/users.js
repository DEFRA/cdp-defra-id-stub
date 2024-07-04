const userAdmin = {
  username: 'admin',
  preferred_username: 'admin@oidc.mock',
  id: '90552794-0613-4023-819a-512aa9d40023',
  teams: ['aabe63e7-87ef-4beb-a596-c810631fc474']
}

const userNonAdmin = {
  username: 'Test User',
  email: 'test.user@oidc.mock',
  id: 'dfa791eb-76b2-434c-ad1f-bb9dc1dd8b48',
  teams: ['7b7c7a75-746a-4083-9072-6e68eb30c90c']
}

async function findAllUsers() {
  return { admin: userAdmin, nonAdmin: userNonAdmin }
}

async function findUser(id) {
  const users = await findAllUsers()
  return users[id]
}

async function findUserEmail(id) {
  const user = await findUser(id)
  if (user?.email) {
    return user.email
  } else if (user?.preferred_username) {
    return user.preferred_username
  }
  return null
}

export { userAdmin, userNonAdmin, findAllUsers, findUser, findUserEmail }
