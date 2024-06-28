import { oidcConfig } from '~/src/server/oidc/oidc-config.js'

const generateConfig = (host) => {
  return {
    issuer: host + oidcConfig.issuerBase,
    authorization_endpoint: host + oidcConfig.authorizationEndpoint,
    pushed_authorization_request_endpoint: `${host}${oidcConfig.issuerBase}/par`,
    token_endpoint: host + oidcConfig.tokenEndpoint,
    jwks_uri: host + oidcConfig.jwksEndpoint,
    userinfo_endpoint: host + oidcConfig.userinfoEndpoint,
    introspection_endpoint: `${host}${oidcConfig.issuerBase}/introspect`,
    end_session_endpoint: `${host}${oidcConfig.issuerBase}/logout`,

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
}

const openIdConfigurationController = {
  handler: (request, h) => {
    return h.response(generateConfig('http://' + request.info.host)).code(200)
  }
}

export { openIdConfigurationController }
