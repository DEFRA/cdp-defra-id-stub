import {
  selectOrganisationController,
  showOrganisationPickerController
} from '~/src/server/oidc/controllers/organisation-controller.js'
import { sessions } from '~/src/server/oidc/helpers/session-store.js'
import { findRelationships } from '~/src/server/registration/helpers/find-relationships.js'

jest.mock('~/src/server/oidc/helpers/session-store.js', () => ({
  sessions: {}
}))

jest.mock('~/src/server/registration/helpers/find-relationships.js')

describe('showOrganisationPickerController', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      query: { sessionId: 'test-session-id' },
      registrations: {},
      logger: {
        error: jest.fn(),
        info: jest.fn()
      }
    }

    mockH = {
      response: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
      view: jest.fn(),
      code: jest.fn().mockReturnThis()
    }

    jest.clearAllMocks()
  })

  test('Should return 404 when session not found', async () => {
    sessions['test-session-id'] = undefined

    await showOrganisationPickerController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith('Session not found')
    expect(mockH.code).toHaveBeenCalledWith(404)
  })

  test('Should return 404 when user has no relationships', async () => {
    sessions['test-session-id'] = {
      user: { userId: 'user-123', email: 'test@test.com' }
    }
    findRelationships.mockResolvedValue([])

    await showOrganisationPickerController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith('No relationships found')
    expect(mockH.code).toHaveBeenCalledWith(404)
  })

  test('Should auto-select when user has single relationship and forceReselection is false', async () => {
    const singleRelationship = {
      relationshipId: 'rel-123',
      organisationId: 'org-123',
      organisationName: 'Test Org',
      relationshipRole: 'employee'
    }

    sessions['test-session-id'] = {
      user: { userId: 'user-123', email: 'test@test.com' },
      forceReselection: false,
      originalAuthorizeUrl: 'http://localhost/authorize?test=1',
      redirectUri: 'http://localhost:3000/callback',
      state: 'abc123',
      sessionId: 'test-session-id'
    }
    findRelationships.mockResolvedValue([singleRelationship])

    await showOrganisationPickerController.handler(mockRequest, mockH)

    expect(sessions['test-session-id'].relationshipId).toBe('rel-123')
    expect(sessions['test-session-id'].relationship).toEqual(singleRelationship)
    expect(mockH.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/callback?code=test-session-id&state=abc123'
    )
  })

  test('Should show picker when user has single relationship but forceReselection is true', async () => {
    const singleRelationship = {
      relationshipId: 'rel-123',
      organisationId: 'org-123',
      organisationName: 'Test Org',
      relationshipRole: 'employee'
    }

    sessions['test-session-id'] = {
      user: { userId: 'user-123', email: 'test@test.com' },
      forceReselection: true
    }
    findRelationships.mockResolvedValue([singleRelationship])

    await showOrganisationPickerController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      'oidc/views/organisation-picker',
      expect.objectContaining({
        pageTitle: 'Choose a business',
        organisationItems: expect.arrayContaining([
          expect.objectContaining({
            value: 'rel-123',
            text: 'Test Org'
          })
        ])
      })
    )
  })

  test('Should show picker when user has multiple relationships', async () => {
    const relationships = [
      {
        relationshipId: 'rel-1',
        organisationId: 'org-1',
        organisationName: 'Org One',
        relationshipRole: 'employee'
      },
      {
        relationshipId: 'rel-2',
        organisationId: 'org-2',
        organisationName: 'Org Two',
        relationshipRole: 'agent'
      }
    ]

    sessions['test-session-id'] = {
      user: { userId: 'user-123', email: 'test@test.com' },
      forceReselection: false
    }
    findRelationships.mockResolvedValue(relationships)

    await showOrganisationPickerController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      'oidc/views/organisation-picker',
      expect.objectContaining({
        organisationItems: expect.arrayContaining([
          expect.objectContaining({ value: 'rel-1', text: 'Org One' }),
          expect.objectContaining({ value: 'rel-2', text: 'Org Two' })
        ])
      })
    )
  })
})

describe('selectOrganisationController', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      payload: {
        sessionId: 'test-session-id',
        relationshipId: 'rel-123'
      },
      registrations: {},
      logger: {
        error: jest.fn(),
        info: jest.fn()
      }
    }

    mockH = {
      response: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
      code: jest.fn().mockReturnThis()
    }

    jest.clearAllMocks()
  })

  test('Should return 400 when sessionId is missing', async () => {
    mockRequest.payload.sessionId = undefined

    await selectOrganisationController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith('Missing required fields')
    expect(mockH.code).toHaveBeenCalledWith(400)
  })

  test('Should return 404 when session not found', async () => {
    sessions['test-session-id'] = undefined

    await selectOrganisationController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith('Session not found')
    expect(mockH.code).toHaveBeenCalledWith(404)
  })

  test('Should return 400 when selected relationship not found', async () => {
    const relationships = [
      {
        relationshipId: 'different-rel',
        organisationId: 'org-1',
        organisationName: 'Org One'
      }
    ]

    sessions['test-session-id'] = {
      user: { userId: 'user-123', email: 'test@test.com' }
    }
    findRelationships.mockResolvedValue(relationships)

    await selectOrganisationController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith(
      'Invalid relationship selection'
    )
    expect(mockH.code).toHaveBeenCalledWith(400)
  })

  test('Should store selected relationship and redirect', async () => {
    const selectedRelationship = {
      relationshipId: 'rel-123',
      organisationId: 'org-123',
      organisationName: 'Test Org',
      relationshipRole: 'employee'
    }

    const relationships = [selectedRelationship]

    sessions['test-session-id'] = {
      user: { userId: 'user-123', email: 'test@test.com' },
      originalAuthorizeUrl: 'http://localhost/authorize?test=1',
      redirectUri: 'http://localhost:3000/callback',
      state: 'abc123',
      sessionId: 'test-session-id'
    }
    findRelationships.mockResolvedValue(relationships)

    await selectOrganisationController.handler(mockRequest, mockH)

    expect(sessions['test-session-id'].relationshipId).toBe('rel-123')
    expect(sessions['test-session-id'].relationship).toEqual(
      selectedRelationship
    )
    expect(mockH.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/callback?code=test-session-id&state=abc123'
    )
  })
})
