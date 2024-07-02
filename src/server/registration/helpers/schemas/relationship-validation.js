import Joi from 'joi'

const relationshipValidation = Joi.object({
  csrfToken: Joi.string().uuid().required(),
  userid: Joi.string().uuid().required().messages({
    'any.only': 'Enter an id',
    'any.required': 'Enter an id'
  }),
  selectedrelationshipid: Joi.string().uuid().optional(),
  relationshipid: Joi.string().uuid().optional(),
  organisationid: Joi.string().optional(),
  organisationname: Joi.string().optional(),
  relationshiprole: Joi.string().optional(),
  rolename: Joi.string().optional(),
  rolenrolestatusame: Joi.string().optional()
})

export { relationshipValidation }
