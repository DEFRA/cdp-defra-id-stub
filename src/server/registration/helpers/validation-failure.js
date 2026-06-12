import { sessionNames } from '#server/common/constants/session-names.js'
import { buildErrorDetails } from '#server/common/helpers/build-error-details.js'

function flashValidationFailure(request, payload, validationError) {
  // Yar concatenates flash values into an array unless isOverride is true.
  request.yar.flash(
    sessionNames.validationFailure,
    {
      formValues: payload,
      formErrors: buildErrorDetails(validationError.details)
    },
    true
  )
}

function readValidationFailure(request) {
  const flashed = request.yar.flash(sessionNames.validationFailure)
  const validationFailure = Array.isArray(flashed) ? flashed.at(-1) : flashed

  return {
    formValues: validationFailure?.formValues ?? {},
    formErrors: validationFailure?.formErrors ?? {}
  }
}

function buildFormErrorSummary(formErrors, fieldIds = {}) {
  return Object.entries(formErrors)
    .filter(([, error]) => error?.message)
    .map(([field, error]) => ({
      text: error.message,
      href: `#${fieldIds[field] ?? field}`
    }))
}

export { buildFormErrorSummary, flashValidationFailure, readValidationFailure }
