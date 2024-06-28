import { generateCodeChallenge } from '~/src/server/oidc/helpers/oidc-crypto.js'

function validateCodeChallenge(session, codeVerifier) {
  if (
    session.codeChallenge === undefined ||
    session.codeChallenge === '' ||
    session.codeChallengeMethod === undefined ||
    session.codeChallengeMethod === ''
  ) {
    return {
      valid: true,
      err: ''
    }
  }

  if (codeVerifier === '') {
    return {
      valid: false,
      err: 'Invalid code verifier. Expected code but client sent none.'
    }
  }

  const challenge = generateCodeChallenge(
    session.codeChallengeMethod,
    codeVerifier
  )
  if (challenge === null) {
    return {
      valid: false,
      err: `failed to generate code challenge for ${session.codeChallengeMethod} ${codeVerifier}`
    }
  }

  if (challenge !== session.codeChallenge) {
    return {
      valid: false,
      err: 'Invalid code verifier. Code challenge did not match hashed code verifier.'
    }
  }

  return {
    valid: true,
    err: ''
  }
}

export { validateCodeChallenge }
