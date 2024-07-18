function includeRedirect(relativeUri, redirectUri) {
  return `${relativeUri}${redirectSearchParam(redirectUri)}`
}
function redirectSearchParam(redirectUri) {
  if (redirectUri) {
    return `?redirect_uri=${encodeURIComponent(redirectUri)}`
  } else {
    return ''
  }
}

export { includeRedirect, redirectSearchParam }
