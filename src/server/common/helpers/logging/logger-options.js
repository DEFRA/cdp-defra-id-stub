import { ecsFormat } from '@elastic/ecs-pino-format'

import { config } from '~/src/config/index.js'

const logConfig = config.get('log')

const formatters = {
  ecs: {
    ...ecsFormat()
  },
  'pino-pretty': { transport: { target: 'pino-pretty' } }
}

export const loggerOptions = {
  enabled: logConfig.enabled,
  ignorePaths: ['/health'],
  redact: {
    paths: logConfig.redact,
    remove: true
  },
  level: logConfig.level,
  ...formatters[logConfig.format],
  nesting: true
}
