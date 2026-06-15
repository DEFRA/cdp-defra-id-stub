import {
  findRegistration,
  findRegistrationByEmail,
  findRegistrations
} from '#server/registration/helpers/find-registration.js'

const registration = {
  userId: 'someUserId',
  email: 'some@example.com'
}

describe('#findRegistration', () => {
  test('Should return registration if found', async () => {
    const store = {
      getRegistration: vi.fn(() => registration)
    }

    const result = await findRegistration('someUserId', store)

    expect(result).toBe(registration)
    expect(store.getRegistration).toHaveBeenCalledWith('someUserId')
  })

  test('Should return nothing if not found', async () => {
    const store = {
      getRegistration: vi.fn()
    }

    const result = await findRegistration('someUserId', store)

    expect(result).toBeUndefined()
  })
})

describe('#findRegistrations', () => {
  test('Should return registrations', async () => {
    const store = {
      listRegistrations: vi.fn(() => [registration])
    }

    const result = await findRegistrations(store)

    expect(result).toEqual([registration])
    expect(store.listRegistrations).toHaveBeenCalled()
  })
})

describe('#findRegistrationByEmail', () => {
  test('Should only return registration with that email', async () => {
    const store = {
      findRegistrationByEmail: vi.fn(() => registration)
    }

    const result = await findRegistrationByEmail('some@example.com', store)

    expect(result).toEqual(registration)
  })

  test('Should not return registration if none with that email', async () => {
    const store = {
      findRegistrationByEmail: vi.fn()
    }

    const result = await findRegistrationByEmail('some@example.com', store)

    expect(result).toBeUndefined()
  })
})
