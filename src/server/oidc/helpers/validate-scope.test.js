import { validateScope } from '~/src/server/oidc/helpers/validate-scope.js'

describe('validateScope function', () => {
  it('should return an empty array for valid scopes', () => {
    const validScope = 'profile email'
    expect(validateScope(validScope)).toEqual([])
  })

  it('should return unsupported scopes', () => {
    const invalidScope = 'profile address'
    expect(validateScope(invalidScope)).toEqual(['address'])
  })

  it('should handle empty input', () => {
    const emptyScope = ''
    expect(validateScope(emptyScope)).toEqual([])
  })

  it('should handle single valid scope', () => {
    const singleValidScope = 'openid'
    expect(validateScope(singleValidScope)).toEqual([])
  })

  it('should handle single invalid scope', () => {
    const singleInvalidScope = 'address'
    expect(validateScope(singleInvalidScope)).toEqual(['address'])
  })
})
