const logoutController = {
  handler: (request, h) => {
    request.logger.info(`Logging out`)
    const redirect = request.query.post_logout_redirect_uri
    return h.redirect(redirect)
  }
}

export { logoutController }
