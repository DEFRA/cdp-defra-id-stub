// import { oidcConfig } from '~/src/server/oidc/oidc-config.js'
import { config } from '~/src/config/index.js'
import { setupValidation } from '~/src/server/oidc/helpers/schemas/setup-validation.js'

const oidcBasePath = config.get('oidc.basePath')

const showSetupController = {
  handler: (request, h) => {
    return h.view('oidc/views/form', {
      pageTitle: 'OIDC Setup Page',
      heading: 'OIDC Setup Page',
      action: `${oidcBasePath}/setup`
    })
  }
}

const setupController = {
  handler: (request, h) => {
    const payload = request?.payload

    const validationResult = setupValidation.validate(payload, {
      abortEarly: false
    })

    if (validationResult?.error) {
      return h.redirect(oidcBasePath)
    }

    return h.redirect(oidcBasePath)
  }
}

export { showSetupController, setupController }
