import jsonwebtoken from 'jsonwebtoken'

const userInfoController = {
  handler: (request, h) => {
    const authHeader = request.headers.authorization
    if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
      return h.response('Missing bearer token').code(401)
    }
    // drop 'Bearer '
    const token = authHeader.slice(7)

    try {
      const decoded = jsonwebtoken.verify(token, request.keys.pem.publicKey)
      return h.response(decoded).code(200)
    } catch (e) {
      request.logger.error(e)
      return h.response('invalid token').code(401)
    }
  }
}

export { userInfoController }
