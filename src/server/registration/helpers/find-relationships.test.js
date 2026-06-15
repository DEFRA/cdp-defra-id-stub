import {
  findRelationships,
  findNonCurrentRelationships,
  findRelationship
} from '#server/registration/helpers/find-relationships.js'

const relationship = {
  userId: 'someUserId',
  relationshipId: 'someRelId'
}

describe('#findRelationship', () => {
  test('Should return relationship', async () => {
    const store = {
      getRelationship: vi.fn(() => relationship)
    }

    const result = await findRelationship('someUserId', 'someRelId', store)

    expect(result).toEqual(relationship)
    expect(store.getRelationship).toHaveBeenCalledWith(
      'someUserId',
      'someRelId'
    )
  })
})

describe('#findRelationships', () => {
  test('Should return relationships', async () => {
    const store = {
      listRelationships: vi.fn(() => [relationship])
    }

    const result = await findRelationships('someUserId', store)

    expect(result).toEqual([relationship])
    expect(store.listRelationships).toHaveBeenCalledWith('someUserId')
  })
})

describe('#findNonCurrentRelationships', () => {
  test('Should return other relationships', async () => {
    const otherRelationship = {
      userId: 'someUserId',
      relationshipId: 'otherRelId'
    }
    const store = {
      listRelationships: vi.fn(() => [relationship, otherRelationship])
    }

    const result = await findNonCurrentRelationships(
      'someUserId',
      'someRelId',
      store
    )

    expect(result).toEqual([otherRelationship])
    expect(store.listRelationships).toHaveBeenCalledWith('someUserId')
  })
})
