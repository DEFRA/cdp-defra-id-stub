import Joi from 'joi'

export const tokenSchema = Joi.object({
  sub: Joi.string().guid().required(),
  correlationId: Joi.string().guid().required(),
  sessionId: Joi.string().guid().required(),
  contactId: Joi.string().required(),
  serviceId: Joi.string().guid().required(),
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  uniqueReference: Joi.string().required(),
  loa: Joi.number().min(0).max(3).required(),
  aal: Joi.number().min(1).max(2).required(),
  enrolmentCount: Joi.number().required(),
  enrolmentRequestCount: Joi.number().required(),
  currentRelationshipId: Joi.string().required(),
  relationships: Joi.array()
    .items(
      Joi.string().pattern(/\w+:\w+:\w+:[0123]:Citizen|Employee|Agent:[0123]/)
    )
    .required(),
  roles: Joi.array()
    .items(Joi.string().pattern(/\w+:\w+:[1234567]/))
    .required()
}).unknown(true)
