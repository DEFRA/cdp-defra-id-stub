import Joi from 'joi'

const registrationValidation = Joi.object({
  csrfToken: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required().messages({
    'any.only': 'Enter an id',
    'any.required': 'Enter an id'
  }),
  contactId: Joi.string().uuid().required().messages({
    'any.only': 'Enter an id',
    'any.required': 'Enter an id'
  }),
  email: Joi.string().email().required().messages({
    'any.only': 'Enter an email address',
    'any.required': 'Enter an email address'
  }),
  firstName: Joi.string().required().messages({
    'any.only': 'Enter a name',
    'any.required': 'Enter a name'
  }),
  lastName: Joi.string().required().messages({
    'any.only': 'Enter a name',
    'any.required': 'Enter a name'
  }),
  uniqueReference: Joi.string().uuid().required().messages({
    'any.only': 'Enter a reference',
    'any.required': 'Enter a reference'
  }),
  loa: Joi.string().required().messages({
    'any.only': 'Enter a level of assurance',
    'any.required': 'Enter a level of assurance'
  }),
  aal: Joi.string().required().messages({
    'any.only': 'Enter authentication assurance',
    'any.required': 'Enter authentication assurance'
  }),
  enrolmentCount: Joi.number().integer().positive().required().messages({
    'any.only': 'Enter enrolments',
    'any.required': 'Enter enrolments'
  }),
  enrolmentRequestCount: Joi.number().integer().positive().required().messages({
    'any.only': 'Enter enrolment requests',
    'any.required': 'Enter enrolment requests'
  }),
  redirect_uri: Joi.string().uri().optional()
})

export { registrationValidation }
