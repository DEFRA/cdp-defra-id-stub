import Joi from 'joi'

const relationshipValidation = Joi.object({
  csrfToken: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  relationshipId: Joi.string().required().messages({
    'any.required': 'Enter a relationship ID',
    'string.empty': 'Enter a relationship ID'
  }),
  organisationId: Joi.string().allow(''),
  organisationName: Joi.string().required().messages({
    'any.required': 'Enter an organisation name',
    'string.empty': 'Enter an organisation name'
  }),
  relationshipRole: Joi.string().required().messages({
    'any.required': 'Select a relationship role',
    'string.empty': 'Select a relationship role'
  }),
  roleName: Joi.string().optional(),
  roleStatus: Joi.string().optional(),
  redirect_uri: Joi.string().uri().optional()
})

export { relationshipValidation }
