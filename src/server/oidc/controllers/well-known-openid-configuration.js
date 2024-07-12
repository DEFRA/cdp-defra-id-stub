import { config } from '~/src/config/index.js'
import { oidcConfig } from '~/src/server/oidc/oidc-config.js'

const appBaseUrl = config.get('appBaseUrl')

const appOidcConfig = {
  issuer: appBaseUrl + oidcConfig.issuerBase,
  authorization_endpoint: appBaseUrl + oidcConfig.authorizationEndpoint,
  pushed_authorization_request_endpoint: `${appBaseUrl}${oidcConfig.issuerBase}/par`,
  token_endpoint: appBaseUrl + oidcConfig.tokenEndpoint,
  jwks_uri: appBaseUrl + oidcConfig.jwksEndpoint,
  userinfo_endpoint: appBaseUrl + oidcConfig.userinfoEndpoint,
  introspection_endpoint: `${appBaseUrl}${oidcConfig.issuerBase}/introspect`,
  end_session_endpoint: `${appBaseUrl}${oidcConfig.issuerBase}/logout`,

  grant_types_supported: oidcConfig.grantTypesSupported,
  response_types_supported: oidcConfig.responseTypesSupported,
  subject_types_supported: oidcConfig.subjectTypesSupported,
  id_token_signing_alg_values_supported:
    oidcConfig.idTokenSigningAlgValuesSupported,
  scopes_supported: oidcConfig.scopesSupported,
  token_endpoint_auth_methods_supported:
    oidcConfig.tokenEndpointAuthMethodsSupported,
  claims_supported: oidcConfig.claimsSupported,
  code_challenge_methods_supported: oidcConfig.claimsSupported
}

const openIdConfigurationController = {
  handler: (request, h) => {
    return h.response(appOidcConfig).code(200)
  }
}

export { openIdConfigurationController }
