import Joi from 'joi'

import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

const confirmSetupController = {
  options: {
    validate: {
      params: Joi.object({
        userId: Joi.string().uuid().required()
      })
    }
  },
  handler: (request, h) => {
    const { userId } = request.params
    logger.info(userId, '====== show confirm =======')
    return h.view('oidc/views/cnfirm', {
      pageTitle: 'DEFRA ID Setup',
      heading: 'DEFRA ID Setup',
      action: ''
    })
  }
}

export { confirmSetupController }
