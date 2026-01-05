import { config } from '~/src/config/index.js'
import { getHost } from './token-controller.js'

describe('token controller', () => {
  afterEach(() => {
    config.reset('appBaseUrl')
  })

  it.each([
    {
      appBaseUrl: 'http://localhost:3200',
      expected: 'http://somewhere.else'
    },
    {
      appBaseUrl: 'https://example.com',
      expected: 'https://somewhere.else'
    }
  ])(
    'should get the host using app-base-url: $appBaseUrl',
    ({ appBaseUrl, expected }) => {
      config.set('appBaseUrl', appBaseUrl)

      const request = {
        info: {
          host: 'somewhere.else'
        }
      }

      const host = getHost(request)

      expect(host).toBe(expected)
    }
  )
})
