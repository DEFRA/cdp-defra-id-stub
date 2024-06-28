import { oidcConfig } from '~/src/server/oidc/oidc-config.js'

const validateScope = (scope) => {
  const scopes = scope.split(' ')

  return scopes
    .filter((s) => s !== '')
    .filter((s) => !oidcConfig.scopesSupported.includes(s))
}

export { validateScope }
