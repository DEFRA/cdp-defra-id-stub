import Joi from 'joi'

const detailsValidation = Joi.object({
  csrfToken: Joi.string().uuid().required(),
  userid: Joi.string().uuid().required().messages({
    'any.only': 'Enter an id',
    'any.required': 'Enter an id'
  }),
  contactid: Joi.string().uuid().required().messages({
    'any.only': 'Enter an id',
    'any.required': 'Enter an id'
  }),
  email: Joi.string().email().required().messages({
    'any.only': 'Enter an email address',
    'any.required': 'Enter an email address'
  }),
  firstname: Joi.string().required().messages({
    'any.only': 'Enter a name',
    'any.required': 'Enter a name'
  }),
  lastname: Joi.string().required().messages({
    'any.only': 'Enter a name',
    'any.required': 'Enter a name'
  }),
  uniqueref: Joi.string().uuid().required().messages({
    'any.only': 'Enter a reference',
    'any.required': 'Enter a reference'
  })
})

export { detailsValidation }
