import * as crypto from 'crypto'
import { generateDefraIdToken } from '~/src/server/oidc/helpers/generate-defraid-token.js'
import jsonwebtoken from 'jsonwebtoken'
import { jwk2pem } from 'pem-jwk'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()

function loadKeyPair(pub, priv) {
  const privatePem = crypto.createPrivateKey({
    key: priv,
    format: 'pem',
    encoding: 'utf8'
  })

  const publicPem = crypto.createPublicKey({
    key: pub,
    format: 'pem',
    encoding: 'utf8'
  })

  const pem = {
    publicKey: publicPem,
    privateKey: privatePem
  }

  const jwk = {
    publicKey: pem.publicKey.export({ format: 'jwk' }),
    privatePem: pem.privateKey.export({ format: 'jwk' })
  }

  const keyId = sha256(publicPem.export({ type: 'spki', format: 'der' }))

  return {
    jwk,
    keyId,
    pem
  }
}

function generateRandomKeypair() {
  const jwk = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // 2048 bits is recommended for RSA keys
    publicKeyEncoding: {
      type: 'spki',
      format: 'jwk'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'jwk'
    }
  })

  const pem = {
    publicKey: jwk2pem(jwk.publicKey),
    privateKey: jwk2pem(jwk.privateKey)
  }
  const keyId = keyID(pem.publicKey)
  return {
    jwk,
    keyId,
    pem
  }
}

function JWKS(keys) {
  const jwks = {
    kty: 'RSA',
    n: Buffer.from(keys.jwk.publicKey.n, 'base64').toString('base64url'),
    e: Buffer.from(keys.jwk.publicKey.e, 'base64').toString('base64url'),
    alg: 'RS256',
    use: 'sig',
    kid: keys.keyId
  }

  return {
    keys: [jwks]
  }
}

async function generateToken(keys, session, host, cache) {
  const claim = await generateDefraIdToken(session, host, cache)
  if (!claim) {
    logger.warn('No claim found')
    return null
  }
  logger.info('Claim found')

  return jsonwebtoken.sign(claim, keys.pem.privateKey, {
    algorithm: 'RS256',
    keyid: keys.keyId
  })
}

async function generateIDToken(keys, session, host, cache) {
  const claim = await generateDefraIdToken(session, host, cache)
  if (!claim) {
    logger.warn('No claim found')
    return null
  }
  claim.nonce = session.nonce
  return jsonwebtoken.sign(claim, keys.pem.privateKey, {
    algorithm: 'RS256',
    keyid: keys.keyId
  })
}

async function generateRefreshToken(keys, session, host, cache) {
  const claim = await generateDefraIdToken(session, host, cache)
  if (!claim) {
    logger.warn('No claim found')
    return null
  }
  return jsonwebtoken.sign(claim, keys.pem.privateKey, {
    algorithm: 'RS256',
    keyid: keys.keyId
  })
}

function generateCodeChallenge(method, codeVerifier) {
  switch (method) {
    case 'plain':
      return codeVerifier
    case 'S256':
      return sha256(codeVerifier)
    default:
      return null
  }
}

function keyID(pemPublicKey) {
  const publicKey = crypto.createPublicKey({
    key: pemPublicKey,
    format: 'pem',
    type: 'spki'
  })
  const publicKeyDER = publicKey.export({ type: 'spki', format: 'der' })
  return sha256(publicKeyDER)
}

function sha256(input) {
  const sha256 = crypto.createHash('sha256').update(input).digest()
  return sha256
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export {
  loadKeyPair,
  generateRandomKeypair,
  JWKS,
  generateToken,
  generateIDToken,
  generateRefreshToken,
  generateCodeChallenge,
  sha256
}
