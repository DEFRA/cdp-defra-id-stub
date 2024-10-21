/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
const homeController = {
  handler: (request, h) => {
    request.logger.info('Home page requested:' + request.url)
    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Home',
      breadcrumbs: [
        {
          text: 'Setup',
          href: '/cdp-defra-id-stub'
        }
      ]
    })
  }
}

const goHomeController = {
  handler: (request, h) => {
    return h.redirect('/')
  }
}

export { homeController, goHomeController }
