import Joi from 'joi'

const relationshipValidation = Joi.object({
  csrfToken: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  relationshipId: Joi.string().uuid().required(),
  organisationId: Joi.string().uuid(),
  organisationName: Joi.string().required(),
  relationshipRole: Joi.string().required(),
  roleName: Joi.string().optional(),
  roleStatus: Joi.string().optional(),
  redirect_uri: Joi.string().uri().optional()
})

export { relationshipValidation }
