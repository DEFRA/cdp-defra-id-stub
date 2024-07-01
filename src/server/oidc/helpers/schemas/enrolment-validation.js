import Joi from 'joi'

const enrolmentValidation = Joi.object({
  csrfToken: Joi.string().uuid().required(),
  userid: Joi.string().uuid().required().messages({
    'any.only': 'Enter an id',
    'any.required': 'Enter an id'
  }),
  loa: Joi.string().required().messages({
    'any.only': 'Enter a level of assurance',
    'any.required': 'Enter a level of assurance'
  }),
  enrolments: Joi.number().integer().positive().required().messages({
    'any.only': 'Enter enrolments',
    'any.required': 'Enter enrolments'
  }),
  enrolmentrequests: Joi.number().integer().positive().required().messages({
    'any.only': 'Enter enrolment requests',
    'any.required': 'Enter enrolment requests'
  })
})

export { enrolmentValidation }
