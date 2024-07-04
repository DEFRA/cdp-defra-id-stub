import { oidcConfig } from '~/src/server/oidc/oidc-config.js'
import {
  getSessionByToken,
  sessions
} from '~/src/server/oidc/helpers/session-store.js'
import {
  generateIDToken,
  generateRefreshToken,
  generateToken
} from '~/src/server/oidc/helpers/oidc-crypto.js'
import { validateCodeChallenge } from '~/src/server/oidc/helpers/validate-code-challenge.js'

const tokenController = {
  handler: async (request, h) => {
    const logger = request.logger

    logger.info(JSON.stringify(request.payload))
    const clientId = request.payload.client_id
    const clientSecret = request.payload.client_secret
    const grantType = request.payload.grant_type
    const code = request.payload.code
    const refreshToken = request.payload.refresh_token
    const codeVerifier = request.payload.code_verifier
    const host = `http://${request.info.host}`

    // validate client id
    if (clientId !== oidcConfig.clientId) {
      logger.error(`Invalid client id ${clientId}`)
      // return h.response(`Invalid client id ${clientId}`).code(401)
    }

    // validate secret
    if (clientSecret !== oidcConfig.clientSecret) {
      logger.error(`Invalid client secret`)
      return h.response(`Invalid client secret`).code(401)
    }

    // get the session depending on the grant type
    let result = null

    if (grantType === 'authorization_code') {
      logger.info('handling authorization code')
      result = getSessionForAuthorizationCode(code)
      const { valid, err } = validateCodeChallenge(result.session, codeVerifier)
      if (!valid) {
        logger.error(err)
        return h.response(err).code(401)
      }
    } else if (grantType === 'refresh_token') {
      logger.info('handling refresh token code')
      result = getSessionForRefreshToken(refreshToken)
    } else {
      return h.response(`invalid grant type ${grantType}`).code(400)
    }

    const { session, valid } = result

    if (!valid) {
      logger.error('session was missing or invalid')
      return h
        .response(`invalid code/token for grant type ${grantType}`)
        .code(400)
    }

    // build the token response

    const tokenResponse = {
      token_type: 'bearer',
      expires_in: oidcConfig.ttl
    }

    // copy over the refresh token if its not there
    // unsure if we still need the !== string 'null' check anymore
    if (refreshToken && refreshToken !== 'null') {
      logger.info(`refresh token ${refreshToken}`)
      tokenResponse.refresh_token = refreshToken
    }

    tokenResponse.access_token = await generateToken(
      request.keys,
      session,
      host,
      request.registrations
    )

    if (session.scopes.includes('openid')) {
      tokenResponse.id_token = await generateIDToken(
        request.keys,
        session,
        host,
        request.registrations
      )
    }
    if (session.scopes.includes('offline_access')) {
      logger.info('generating a refresh token')
      tokenResponse.refresh_token = await generateRefreshToken(
        request.keys,
        session,
        host,
        request.registrations
      )
    }

    logger.info(tokenResponse)

    return h
      .response(tokenResponse)
      .header('Cache-Control', 'no-cache, no-store, must-revalidate')
      .code(200)
  }
}

function getSessionForAuthorizationCode(code) {
  const session = sessions[code]
  if (!session || session.granted) {
    return { session: null, valid: false }
  }
  sessions[code].granted = true
  return {
    session,
    valid: true
  }
}

function getSessionForRefreshToken(refreshToken) {
  const session = getSessionByToken(refreshToken)
  return {
    session,
    valid: session !== undefined
  }
}

export { tokenController }
