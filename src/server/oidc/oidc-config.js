import { config } from '~/src/config/index.js'

const appBaseUrl = config.get('appBaseUrl')
const oidcBasePath = config.get('oidc.basePath')

const oidcConfig = {
  clientId: config.get('oidc.clientId'),
  clientSecret: config.get('oidc.clientSecret'),
  issuerBase: oidcBasePath,
  authorizationEndpoint: `${oidcBasePath}/authorize`,
  tokenEndpoint: `${oidcBasePath}/token`,
  userinfoEndpoint: `${oidcBasePath}/userinfo`,
  jwksEndpoint: `${oidcBasePath}/.well-known/jwks.json`,
  discoveryEndpoint: `${oidcBasePath}/.well-known/openid-configuration`,

  openidScope: 'openid',

  grantTypesSupported: [
    'authorization_code',
    'refresh_token',
    'client_credentials'
  ],
  responseTypesSupported: ['code'],
  subjectTypesSupported: ['public'],

  idTokenSigningAlgValuesSupported: ['RS256'],

  scopesSupported: [
    'openid',
    'email',
    'groups',
    'profile',
    'api://63983fc2-cfff-45bb-8ec2-959e21062b9a/cdp.user',
    'offline_access',
    'user.read'
  ],

  tokenEndpointAuthMethodsSupported: [
    'client_secret_basic',
    'client_secret_post'
  ],

  claimsSupported: [
    'sub',
    'email',
    'email_verified',
    'preferred_username',
    'phone_number',
    'address',
    'groups',
    'iss',
    'aud'
  ],
  codeChallengeMethodsSupported: ['plain', 'S256'],
  ttl: 3600, // seconds
  refreshTtl: 3600 * 6
}

export { appBaseUrl, oidcConfig, oidcBasePath }
