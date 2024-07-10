import { oidcConfig } from '~/src/server/oidc/oidc-config.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { validateScope } from '~/src/server/oidc/helpers/validate-scope.js'
import { newSession } from '~/src/server/oidc/helpers/session-store.js'
import { findUser, findAllUsers } from '~/src/server/oidc/helpers/users.js'
import { renderLoginPage } from '~/src/server/oidc/helpers/render-login-page.js'
import { config } from '~/src/config/index.js'
import { loginValidation } from '~/src/server/oidc/helpers/schemas/login-validation.js'

const oidcBasePath = config.get('oidc.basePath')
const registrationPath = `${oidcBasePath}/register`

const authorizeController = {
  handler: async (request, h) => {
    if (config.get('oidc.showLogin') && request.query.user === undefined) {
      request.logger.info(
        { url: request.url },
        'No user, redirect to login page' + request.url
      )
      const allUsers = await findAllUsers(request.registrations)
      if (!allUsers || allUsers.length === 0) {
        request.logger.info('No users found, redirect to register page')
        return h.redirect(registrationPath)
      }

      return renderLoginPage(allUsers, request.url, h)
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
      return h.redirect(oidcBasePath)
    }

    const loginUser = request.query.user
    const clientId = request.query.client_id
    const responseType = request.query.response_type
    const redirectUri = request.query.redirect_uri
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
    return h.redirect(location.toString())
  }
}

const loginController = {
  handler: async (request, h) => {
    const redirectUrl = request.query.redirect_url ?? ''
    const allUsers = await findAllUsers(request.registrations)
    if (!allUsers || allUsers.length === 0) {
      request.logger.info('No users found, redirect to register page')
      return h.redirect(registrationPath)
    }
    request.logger.info(
      { allUsers, redirectUrl },
      'Rendering login page ' + redirectUrl
    )
    return renderLoginPage(allUsers, redirectUrl, h)
  }
}

export { authorizeController, loginController }
