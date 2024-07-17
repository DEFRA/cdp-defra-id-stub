import Joi from 'joi'

const relationshipValidation = Joi.object({
  csrfToken: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  relationshipId: Joi.string().required(),
  organisationId: Joi.string(),
  organisationName: Joi.string().required(),
  relationshipRole: Joi.string().required(),
  roleName: Joi.string().optional(),
  roleStatus: Joi.string().optional(),
  redirect_uri: Joi.string().uri().optional()
})

export { relationshipValidation }
