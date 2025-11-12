import * as crypto from 'crypto'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()

const sessions = {}

function getSessionId() {
  return crypto.randomUUID()
}

function newSession(
  scope,
  nonce,
  user,
  challenge,
  challengeMethod,
  forceReselection,
  originalAuthorizeUrl,
  redirectUri,
  state
) {
  const id = getSessionId()

  sessions[id] = {
    sessionId: id,
    scopes: scope.split(' '),
    oidcNonce: nonce,
    user,
    granted: false,
    codeChallenge: challenge,
    codeChallengeMethod: challengeMethod,
    forceReselection,
    originalAuthorizeUrl: originalAuthorizeUrl || '',
    redirectUri: redirectUri || '',
    state: state || ''
  }

  logger.info(`Creating a new session ${JSON.stringify(sessions[id])}`)

  return sessions[id]
}

function getSessionByToken(token) {
  const decodedToken = jsonwebtoken.decode(token)
  const sessionId = decodedToken?.jti
  return sessions[sessionId]
}

export { getSessionByToken, newSession, sessions }
