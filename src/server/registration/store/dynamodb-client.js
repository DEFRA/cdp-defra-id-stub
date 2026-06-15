import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

function createDynamoDbDocumentClient(options) {
  const { endpoint, region } = options
  const hasAwsCredentials =
    Boolean(process.env.AWS_ACCESS_KEY_ID) &&
    Boolean(process.env.AWS_SECRET_ACCESS_KEY)

  const clientConfig = {
    region
  }

  if (endpoint) {
    clientConfig.endpoint = endpoint
  }

  const isLocalEndpoint =
    endpoint &&
    (endpoint.includes('localhost') || endpoint.includes('127.0.0.1'))

  if (isLocalEndpoint && !hasAwsCredentials) {
    clientConfig.credentials = {
      accessKeyId: 'test',
      secretAccessKey: 'test'
    }
  }

  const client = new DynamoDBClient(clientConfig)
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true
    }
  })
}

export { createDynamoDbDocumentClient }
