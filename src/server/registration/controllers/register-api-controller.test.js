import * as crypto from 'crypto'

import { registerApiController } from '#server/registration/controllers/register-api-controller.js'
import { MemoryRegistrationsStore } from '#server/registration/store/memory-store.js'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

function registrationPayload(relationship) {
  return {
    email: 'tester@example.com',
    firstName: 'Test',
    lastName: 'User',
    loa: '1',
    aal: '1',
    enrolmentCount: 1,
    enrolmentRequestCount: 1,
    relationships: [
      {
        organisationName: 'Defra',
        relationshipRole: 'Employee',
        ...relationship
      }
    ]
  }
}

describe('registerApiController', () => {
  let store
  let mockH

  async function register(payload) {
    const request = {
      payload,
      registrationsStore: store,
      logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn()
      }
    }
    await registerApiController.handler(request, mockH)
    const { userId } = mockH.response.mock.calls[0][0]
    return store.listRelationships(userId)
  }

  beforeEach(() => {
    store = new MemoryRegistrationsStore()
    mockH = {
      response: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      header: vi.fn().mockReturnThis()
    }
  })

  test('Should store organisationId as sent', async () => {
    const organisationId = crypto.randomUUID()
    const [relationship] = await register(
      registrationPayload({ organisationId })
    )

    expect(mockH.code).toHaveBeenCalledWith(201)
    expect(relationship.organisationId).toBe(organisationId)
  })

  test('Should store relationshipId and organisationId separately', async () => {
    const relationshipId = crypto.randomUUID()
    const organisationId = crypto.randomUUID()
    const [relationship] = await register(
      registrationPayload({ relationshipId, organisationId })
    )

    expect(relationship.relationshipId).toBe(relationshipId)
    expect(relationship.organisationId).toBe(organisationId)
  })

  test('Should generate relationshipId and organisationId when not sent', async () => {
    const [relationship] = await register(registrationPayload({}))

    expect(relationship.relationshipId).toMatch(uuidPattern)
    expect(relationship.organisationId).toMatch(uuidPattern)
    expect(relationship.organisationId).not.toBe(relationship.relationshipId)
  })
})
