import { JWKS } from '#server/oidc/helpers/oidc-crypto.js'

const jwksController = {
  handler: (request, h) => {
    return h.response(JWKS(request.keys)).code(200)
  }
}

export { jwksController }
