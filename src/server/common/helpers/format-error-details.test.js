import { formatErrorDetailsAsString } from '~/src/server/common/helpers/format-error-details.js'
import { buildErrorDetails } from '~/src/server/common/helpers/build-error-details.js'
import { loginValidation } from '~/src/server/oidc/helpers/schemas/login-validation.js'

describe('formatErrorDetailsAsString', () => {
  test('should convert error details object to comma-separated string', () => {
    const errorDetails = {
      client_id: { message: '"client_id" is required' },
      scope: { message: '"scope" is required' }
    }

    const result = formatErrorDetailsAsString(errorDetails)

    expect(result).toContain('"client_id" is required')
    expect(result).toContain('"scope" is required')
    expect(result).toContain(', ')
  })

  test('should handle single error', () => {
    const errorDetails = {
      client_id: { message: '"client_id" is required' }
    }

    const result = formatErrorDetailsAsString(errorDetails)

    expect(result).toBe('"client_id" is required')
  })

  test('should handle empty object', () => {
    const errorDetails = {}

    const result = formatErrorDetailsAsString(errorDetails)

    expect(result).toBe('')
  })

  test('should compose with buildErrorDetails', () => {
    const invalidQuery = {
      user: 'test@example.com'
      // Missing: client_id, response_type, redirect_uri, state, scope
    }

    const validationResult = loginValidation.validate(invalidQuery, {
      abortEarly: false
    })

    const errorMessage = formatErrorDetailsAsString(
      buildErrorDetails(validationResult.error.details)
    )

    expect(typeof buildErrorDetails(validationResult.error.details)).toBe(
      'object'
    )
    expect(
      Array.isArray(buildErrorDetails(validationResult.error.details))
    ).toBe(false)
    expect(typeof errorMessage).toBe('string')
    expect(errorMessage).toContain('required')
  })

  test('should accept login_hint parameter', () => {
    // Reproduces the original issue: authorize endpoint received login_hint
    // which caused validation error. Now login_hint is accepted as optional.
    const queryWithLoginHint = {
      serviceId: 'd7d72b79-9c62-ee11-8df0-000d3adf7047',
      login_hint: 'sarah.trader@example.com',
      client_id: '2fb0d715-affa-4bf1-836e-44a464e3fbea',
      response_type: 'code',
      redirect_uri: 'https://example.com/callback',
      state: '78oSs4zRk4IzEhLrhkccmn',
      scope: 'openid profile email',
      user: 'sarah.trader@example.com'
    }

    const validationResult = loginValidation.validate(queryWithLoginHint, {
      abortEarly: false
    })

    // Should not have any validation errors
    expect(validationResult.error).toBeUndefined()
  })
})
