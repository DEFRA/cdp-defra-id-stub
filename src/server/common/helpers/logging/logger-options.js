import ecsFormat from '@elastic/ecs-pino-format'

import { config } from '~/src/config/index.js'

const loggerOptions = {
  enabled: !config.get('isTest'),
  ignorePaths: ['/health', '/public'],
  redact: {
    paths: [
      'req',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers',
      'responseTime'
    ],
    remove: true
  },
  level: config.get('logLevel'),
  ...(config.get('isDevelopment')
    ? { transport: { target: 'pino-pretty' } }
    : ecsFormat())
}

export { loggerOptions }
