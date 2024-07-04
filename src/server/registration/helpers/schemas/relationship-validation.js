import Joi from 'joi'

const relationshipValidation = Joi.object({
  csrfToken: Joi.string().uuid().required(),
  userid: Joi.string().uuid().required().messages({
    'any.only': 'Enter an id',
    'any.required': 'Enter an id'
  }),
  relationshipId: Joi.string().uuid().required(),
  organisationId: Joi.string().required(),
  organisationName: Joi.string().required(),
  relationshipRole: Joi.string().required(),
  rolename: Joi.string().optional(),
  rolenrolestatusame: Joi.string().optional()
})

export { relationshipValidation }
