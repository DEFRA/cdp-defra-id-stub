import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { renderLoginPage } from '~/src/server/oidc/helpers/render-login-page.js'
import { loginValidation } from '~/src/server/oidc/helpers/schemas/login-validation.js'
import { newSession } from '~/src/server/oidc/helpers/session-store.js'
import { findAllUsers, findUser } from '~/src/server/oidc/helpers/users.js'
import { validateScope } from '~/src/server/oidc/helpers/validate-scope.js'
import { oidcBasePath, oidcConfig } from '~/src/server/oidc/oidc-config.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'
import { registrationAction } from '~/src/server/registration/helpers/registration-paths.js'

const appBaseUrl = config.get('appBaseUrl')

const authorizeController = {
  handler: async (request, h) => {
    const redirectUri = request.query?.redirect_uri

    // Check for cached authenticated user in session (SSO behavior)
    const cachedUserEmail = request.yar.get('authenticated_user')

    if (
      config.get('oidc.showLogin') &&
      request.query.user === undefined &&
      !cachedUserEmail
    ) {
      const requestUrl = `${appBaseUrl}${request.path}${request.url.search}`
      request.logger.debug({ requestUrl }, 'No user, redirect to login page')

      const allUsers = await findAllUsers(request.registrations)
      if (!allUsers || allUsers.length === 0) {
        request.logger.info('No users found, redirect to register page')
        return h.redirect(registrationAction(requestUrl))
      }

      return renderLoginPage(allUsers, requestUrl, h)
    }

    const validationResult = loginValidation.validate(request.query, {
      abortEarly: false
    })

    if (validationResult?.error) {
      request.logger.warn(validationResult?.error, 'Login query error')
      const errorDetails = buildErrorDetails(validationResult.error.details)

      request.yar.flash('validationFailure', {
        formValues: request.query,
        formErrors: errorDetails
      })

      // Extract error messages from the errorDetails object
      const errorMessages = Object.entries(errorDetails)
        .map(([field, error]) => `${field}: ${error.message}`)
        .join(', ')

      return h.response(`Unsupported payload: ${errorMessages}`).code(400)
    }

    // Use cached user email if no user query param provided (SSO behavior)
    const loginUser = request.query.user || cachedUserEmail
    const clientId = request.query.client_id
    const responseType = request.query.response_type
    const { scope, state } = request.query
    const codeChallengeMethod = request.query.code_challenge_method

    // validate request
    const unsupportedScopes = validateScope(scope)
    if (unsupportedScopes.length > 0) {
      request.logger.error(`Unsupported scopes ${unsupportedScopes.join(',')}`)
      return h
        .response(`Unsupported scopes ${unsupportedScopes.join(',')}`)
        .code(400)
    }

    if (clientId !== oidcConfig.clientId) {
      request.logger.warn(`Invalid client ID ${clientId}`)
      // return h.response(`Invalid client id ${clientId}`).code(401)
    }

    if (!oidcConfig.responseTypesSupported.includes(responseType)) {
      request.logger.error(`Invalid response type ${responseType}`)
      return h.response(`Unsupported response type ${responseType}`).code(400)
    }

    if (
      codeChallengeMethod &&
      !oidcConfig.codeChallengeMethodsSupported.includes(codeChallengeMethod)
    ) {
      request.logger.error(
        `Invalid code challenge method ${codeChallengeMethod}`
      )
      return h
        .response(`Unsupported code_challenge_method  ${codeChallengeMethod}`)
        .code(400)
    }

    const user = await findUser(loginUser, request.registrations)
    if (user === undefined) {
      request.logger.error(`Invalid user selected ${request.query.user}`)
      return h.response(`Invalid user selection!`).code(400)
    }

    // Store authenticated user in session for SSO behavior
    request.yar.set('authenticated_user', user.email)

    const originalAuthorizeUrl = `${appBaseUrl}${request.path}${request.url.search}`
    const forceReselection = request.query.forceReselection === 'true'

    const session = newSession(
      scope,
      request.query.nonce,
      user,
      request.query.code_challenge,
      request.query.code_challenge_method,
      forceReselection,
      originalAuthorizeUrl,
      redirectUri,
      state
    )

    // Check if user has relationships and need to select organisation
    const relationships = await findRelationships(
      user.userId,
      request.registrations
    )

    if (relationships && relationships.length > 0 && !session.relationshipId) {
      request.logger.info(
        { userId: user.userId, relationshipCount: relationships.length },
        'User has relationships, redirect to organisation picker'
      )
      return h.redirect(
        `${oidcBasePath}/organisations?sessionId=${session.sessionId}`
      )
    }

    const location = new URL(redirectUri)
    location.searchParams.append('code', session.sessionId)
    location.searchParams.append('state', state)
    request.logger.info(
      `Authenticated, redirect to location: [${location.toString()}]`
    )
    return h.redirect(location.toString())
  }
}

const loginController = {
  options: {
    validate: {
      query: Joi.object({
        redirect_uri: Joi.string().uri().optional()
      })
    }
  },
  handler: async (request, h) => {
    const redirectUri = request.query.redirect_uri ?? ''
    const allUsers = await findAllUsers(request.registrations)
    if (!allUsers || allUsers.length === 0) {
      request.logger.info(
        `No users found, redirect to register page: [${request.url}]`
      )
      return h.redirect(registrationAction(redirectUri))
    }
    request.logger.info({ allUsers, redirectUri }, 'Rendering login page ')
    return renderLoginPage(allUsers, redirectUri, h)
  }
}

export { authorizeController, loginController }
