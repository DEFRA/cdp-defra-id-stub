import Joi from 'joi'

const roleNameValidation = Joi.object({
  csrfToken: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  relationshipId: Joi.string().uuid().required(),
  roleName: Joi.string().required(),
  roleStatus: Joi.string().required()
})

export { roleNameValidation }
