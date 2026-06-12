const oneDayMillis = 24 * 60 * 60 * 1000
const defaultRegistrationTtlMs = oneDayMillis * 3

function registrationExpiresAt(ttlMs, now = Date.now()) {
  return Math.floor((now + ttlMs) / 1000)
}

function isExpired(expiresAt, now = Date.now()) {
  if (!expiresAt) {
    return false
  }

  return Number(expiresAt) * 1000 <= now
}

export { defaultRegistrationTtlMs, isExpired, registrationExpiresAt }
