import {
  findRelationships,
  findNonCurrentRelationships,
  findRelationship
} from '~/src/server/registration/helpers//find-relationships.js'

const relationship = {
  userId: 'someUserId',
  relationshipId: 'someRelId'
}

describe('#findRelationship', () => {
  test('Should return relationship', async () => {
    const cache = {
      get: jest.fn((key) => {
        if (key === 'defra-id:relationship:someUserId:someRelId') {
          return relationship
        } else {
          return null
        }
      })
    }

    const result = await findRelationship('someUserId', 'someRelId', cache)

    expect(result).toEqual(relationship)
    expect(cache.get).toHaveBeenCalledWith(
      'defra-id:relationship:someUserId:someRelId'
    )
  })
})

describe('#findRelationships', () => {
  test('Should return relationships', async () => {
    const cache = {
      get: jest.fn((key) => {
        switch (key) {
          case 'defra-id:relationship-ids:someUserId':
            return ['someRelId', 'otherRelId']
          case 'defra-id:relationship:someUserId:someRelId':
            return relationship
          default:
            return null
        }
      })
    }

    const result = await findRelationships('someUserId', cache)

    expect(result).toEqual([relationship])
    expect(cache.get).toHaveBeenCalledWith(
      'defra-id:relationship-ids:someUserId'
    )
    expect(cache.get).toHaveBeenCalledWith(
      'defra-id:relationship:someUserId:someRelId'
    )
  })
})

describe('#findNonCurrentRelationships', () => {
  test('Should return other relationships', async () => {
    const otherRelationship = {
      userId: 'someUserId',
      relationshipId: 'otherRelId'
    }
    const cache = {
      get: jest.fn((key) => {
        switch (key) {
          case 'defra-id:relationship-ids:someUserId':
            return ['someRelId', 'otherRelId']
          case 'defra-id:relationship:someUserId:someRelId':
            return relationship
          case 'defra-id:relationship:someUserId:otherRelId':
            return otherRelationship
          default:
            return null
        }
      })
    }

    const result = await findNonCurrentRelationships(
      'someUserId',
      'someRelId',
      cache
    )

    expect(result).toEqual([otherRelationship])
    expect(cache.get).toHaveBeenCalledWith(
      'defra-id:relationship:someUserId:someRelId'
    )
    expect(cache.get).toHaveBeenCalledWith(
      'defra-id:relationship:someUserId:otherRelId'
    )
  })
})
