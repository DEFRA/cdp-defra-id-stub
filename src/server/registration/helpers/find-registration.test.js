import {
  findRegistration,
  findRegistrationByEmail,
  findRegistrations
} from '~/src/server/registration/helpers//find-registration.js'

describe('#findRegistration', () => {
  test('Should return registration if found', async () => {
    const registration = {
      userId: 'someUserId'
    }
    const cache = {
      get: jest.fn((k) => {
        return registration
      })
    }

    const result = await findRegistration('someUserId', cache)

    expect(result).toBe(registration)
    expect(cache.get).toHaveBeenCalledWith('defra-id:registration:someUserId')
  })

  test('Should return nothing if not found', async () => {
    const cache = {
      get: jest.fn()
    }

    const result = await findRegistration('someUserId', cache)

    expect(result).toBeUndefined()
  })
})

describe('#findRegistrations', () => {
  test('Should return registrations', async () => {
    const registration = {
      userId: 'someUserId'
    }
    const mockCache = jest.fn()
    const cache = {
      get: mockCache
    }
    mockCache
      .mockReturnValueOnce(['someUserId'])
      .mockReturnValueOnce(registration)

    const result = await findRegistrations(cache)

    expect(result).toEqual([registration])
    expect(cache.get).toHaveBeenCalledWith('defra-id:registration-ids')
    expect(cache.get).toHaveBeenCalledWith('defra-id:registration:someUserId')
  })
})

describe('#findRegistrationByEmail', () => {
  test('Should only return registration with that email', async () => {
    const registration = {
      userId: 'someUserId',
      email: 'some@example.com'
    }
    const otherRegistration = {
      userId: 'otherUserId',
      email: 'other@example.com'
    }
    const mockCache = jest.fn()
    const cache = {
      get: mockCache
    }
    mockCache
      .mockReturnValueOnce(['someUserId', 'otherUserId'])
      .mockReturnValueOnce(registration)
      .mockReturnValueOnce(otherRegistration)

    const result = await findRegistrationByEmail('some@example.com', cache)

    expect(result).toEqual(registration)
  })

  test('Should not return registration if none with that email', async () => {
    const otherRegistration = {
      userId: 'otherUserId',
      email: 'other@example.com'
    }
    const mockCache = jest.fn()
    const cache = {
      get: mockCache
    }
    mockCache
      .mockReturnValueOnce(['otherUserId'])
      .mockReturnValueOnce(otherRegistration)

    const result = await findRegistrationByEmail('some@example.com', cache)

    expect(result).toBeUndefined()
  })
})
