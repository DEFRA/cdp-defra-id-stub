const logoutController = {
  handler: (request, h) => {
    request.logger.info(`Logging out`)

    // Clear authenticated user from session
    request.yar.clear('authenticated_user')

    const redirect = request.query.post_logout_redirect_uri
    return h.redirect(redirect)
  }
}

export { logoutController }
