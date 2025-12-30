import Joi from 'joi'

const fullRegistrationValidation = Joi.object({
  userId: Joi.string().uuid().optional(),
  contactId: Joi.string().uuid().optional(),
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  uniqueReference: Joi.string().uuid().optional(),
  loa: Joi.string().required(),
  aal: Joi.string().optional(),
  enrolmentCount: Joi.number().integer().positive().required(),
  enrolmentRequestCount: Joi.number().integer().positive().required(),
  relationships: Joi.array()
    .items(
      Joi.object({
        relationshipId: Joi.string().uuid().optional(),
        organisationId: Joi.string().uuid().optional(),
        organisationName: Joi.string().required(),
        relationshipRole: Joi.string().required(),
        roleName: Joi.string().optional(),
        roleStatus: Joi.string().optional()
      })
    )
    .optional()
})

export { fullRegistrationValidation }
