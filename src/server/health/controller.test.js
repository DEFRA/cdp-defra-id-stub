import { healthController } from '#server/health/controller.js'

describe('#healthController', () => {
  const mockViewHandler = {
    response: vi.fn().mockReturnThis(),
    code: vi.fn().mockReturnThis()
  }

  test('Should provide expected response', () => {
    healthController.handler(null, mockViewHandler)

    expect(mockViewHandler.response).toHaveBeenCalledWith({
      message: 'success'
    })
    expect(mockViewHandler.code).toHaveBeenCalledWith(200)
  })
})
