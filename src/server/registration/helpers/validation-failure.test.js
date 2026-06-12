import { describe, expect, test, vi } from 'vitest'

import {
  buildFormErrorSummary,
  flashValidationFailure,
  readValidationFailure
} from '#server/registration/helpers/validation-failure.js'

describe('validation-failure', () => {
  test('flashValidationFailure stores form values and errors in yar', () => {
    const flash = vi.fn()
    const request = {
      yar: { flash },
      payload: {}
    }
    const payload = { email: 'bad-email' }
    const validationError = {
      details: [{ path: ['email'], message: 'Enter an email address' }]
    }

    flashValidationFailure(request, payload, validationError)

    expect(flash).toHaveBeenCalledWith(
      'validationFailure',
      {
        formValues: payload,
        formErrors: {
          email: { message: 'Enter an email address' }
        }
      },
      true
    )
  })

  test('readValidationFailure returns flashed values once', () => {
    const flash = vi
      .fn()
      .mockReturnValueOnce({
        formValues: { email: 'person@example.com' },
        formErrors: { firstName: { message: 'Enter a name' } }
      })
      .mockReturnValueOnce(undefined)
    const request = { yar: { flash } }

    expect(readValidationFailure(request)).toEqual({
      formValues: { email: 'person@example.com' },
      formErrors: { firstName: { message: 'Enter a name' } }
    })
    expect(readValidationFailure(request)).toEqual({
      formValues: {},
      formErrors: {}
    })
  })

  test('readValidationFailure unwraps yar flash arrays', () => {
    const flash = vi.fn().mockReturnValueOnce([
      {
        formValues: { email: 'bad' },
        formErrors: { email: { message: 'Enter an email address' } }
      }
    ])
    const request = { yar: { flash } }

    expect(readValidationFailure(request)).toEqual({
      formValues: { email: 'bad' },
      formErrors: { email: { message: 'Enter an email address' } }
    })
  })

  test('buildFormErrorSummary maps form errors to summary links', () => {
    expect(
      buildFormErrorSummary({
        organisationName: { message: 'Enter an organisation name' },
        relationshipId: { message: 'Enter a relationship ID' }
      })
    ).toEqual([
      {
        text: 'Enter an organisation name',
        href: '#organisationName'
      },
      {
        text: 'Enter a relationship ID',
        href: '#relationshipId'
      }
    ])
  })
})
