function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase()
}

function userPk(userId) {
  return `USER#${userId}`
}

function relationshipSk(relationshipId) {
  return `REL#${relationshipId}`
}

function registrationIndexSk(userId) {
  return `REG#${userId}`
}

function emailPk(email) {
  return `EMAIL#${normalizeEmail(email)}`
}

const keys = {
  registrationIndexPk: 'INDEX',
  profileSk: 'PROFILE',
  emailUserSkPrefix: 'USER#',
  emailLookupSk: (userId) => `USER#${userId}`,
  userPk,
  relationshipSk,
  registrationIndexSk,
  emailPk
}

export { keys, normalizeEmail }
