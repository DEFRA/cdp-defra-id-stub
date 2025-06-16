import Joi from 'joi'

const roleNameValidation = Joi.object({
  csrfToken: Joi.string().required(),
  userId: Joi.string().uuid().required(),
  relationshipId: Joi.string().required(),
  roleName: Joi.string().required(),
  roleStatus: Joi.string().required(),
  redirect_uri: Joi.string().uri().optional()
})

export { roleNameValidation }
