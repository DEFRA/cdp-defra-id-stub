import Joi from 'joi'

const relationshipValidation = Joi.object({
  csrfToken: Joi.string().uuid().required(),
  userid: Joi.string().uuid().required().messages({
    'any.only': 'Enter an id',
    'any.required': 'Enter an id'
  }),
  relationshipid: Joi.string().uuid().required(),
  organisationid: Joi.string().required(),
  organisationname: Joi.string().required(),
  relationshiprole: Joi.string().required(),
  rolename: Joi.string().optional(),
  rolenrolestatusame: Joi.string().optional()
})

export { relationshipValidation }
