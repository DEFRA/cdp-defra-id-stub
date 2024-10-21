import Joi from 'joi'

import { oidcConfig } from '~/src/server/oidc/oidc-config.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { validateScope } from '~/src/server/oidc/helpers/validate-scope.js'
import { newSession } from '~/src/server/oidc/helpers/session-store.js'
import { findUser, findAllUsers } from '~/src/server/oidc/helpers/users.js'
import { renderLoginPage } from '~/src/server/oidc/helpers/render-login-page.js'
import { config } from '~/src/config/index.js'
import { loginValidation } from '~/src/server/oidc/helpers/schemas/login-validation.js'
import { registrationAction } from '~/src/server/registration/helpers/registration-paths.js'

const appBaseUrl = config.get('appBaseUrl')

const authorizeController = {
  handler: async (request, h) => {
    const redirectUri = request.query?.redirect_uri
    if (config.get('oidc.showLogin') && request.query.user === undefined) {
      const requestUrl = `${appBaseUrl}${request.path}${request.url.search}`
      request.logger.info({ requestUrl }, 'No user, redirect to login page')

      const allUsers = await findAllUsers(request.registrations)
      if (!allUsers || allUsers.length === 0) {
        request.logger.info(
          `No users found, redirect to register page: [${requestUrl}]`
        )
        return h.redirect(registrationAction(requestUrl)) // this may have to be the whole URL
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
      return h
        .response(`Unsupported payload ${errorDetails.join(',')}`)
        .code(400)
    }

    const loginUser = request.query.user
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

    const session = newSession(
      scope,
      request.query.nonce,
      user,
      request.query.code_challenge,
      request.query.code_challenge_method
    )

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
