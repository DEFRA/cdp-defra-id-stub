import Joi from 'joi'

const loginValidation = Joi.object({
  user: Joi.string().optional(),
  client_id: Joi.string().required(),
  response_type: Joi.string().required(),
  redirect_uri: Joi.string().required(),
  state: Joi.string().required(),
  scope: Joi.string().required(),
  code_challenge_method: Joi.string().optional(),
  code_challenge: Joi.string().optional(),
  nonce: Joi.string().optional()
})

export { loginValidation }
