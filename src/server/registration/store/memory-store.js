import { normalizeEmail } from '#server/registration/store/key-builders.js'
import {
  defaultRegistrationTtlMs,
  isExpired,
  registrationExpiresAt
} from '#server/registration/store/ttl.js'

class MemoryRegistrationsStore {
  constructor(options = {}) {
    this.registrations = new Map()
    this.registrationIds = new Set()
    this.emailToUserId = new Map()
    this.relationships = new Map()
    this.relationshipIdsByUserId = new Map()
    this.ttlMs = options.ttlMs ?? defaultRegistrationTtlMs
  }

  async getRegistration(userId) {
    const registration = this.registrations.get(userId)
    if (!registration || isExpired(registration.expiresAt)) {
      return undefined
    }

    const { expiresAt, ...record } = registration
    return record
  }

  async listRegistrations() {
    return Array.from(this.registrations.values())
      .filter((registration) => !isExpired(registration.expiresAt))
      .map(({ userId, email }) => ({
        userId,
        email
      }))
  }

  async findRegistrationByEmail(email) {
    const userId = this.emailToUserId.get(normalizeEmail(email))
    return userId ? this.getRegistration(userId) : undefined
  }

  async putRegistration(userId, registration) {
    const previous = this.registrations.get(userId)
    if (previous?.email && previous.email !== registration.email) {
      this.emailToUserId.delete(normalizeEmail(previous.email))
    }

    this.registrations.set(userId, {
      ...registration,
      expiresAt: registrationExpiresAt(this.ttlMs)
    })
    this.registrationIds.add(userId)
    this.emailToUserId.set(normalizeEmail(registration.email), userId)
  }

  async deleteRegistration(userId) {
    const registration = this.registrations.get(userId)
    if (registration?.email) {
      this.emailToUserId.delete(normalizeEmail(registration.email))
    }

    await this.deleteAllRelationships(userId)
    this.registrations.delete(userId)
    this.registrationIds.delete(userId)
  }

  async getRelationship(userId, relationshipId) {
    const relationship = this.relationships.get(`${userId}:${relationshipId}`)
    if (!relationship || isExpired(relationship.expiresAt)) {
      return undefined
    }

    const { expiresAt, ...record } = relationship
    return record
  }

  async listRelationships(userId) {
    const relationshipIds =
      this.relationshipIdsByUserId.get(userId) ?? new Set()
    return Array.from(relationshipIds)
      .map((relationshipId) =>
        this.relationships.get(`${userId}:${relationshipId}`)
      )
      .filter(Boolean)
      .filter((relationship) => !isExpired(relationship?.expiresAt))
      .map((relationship) => {
        const { expiresAt, ...record } = relationship
        return record
      })
  }

  async putRelationship(userId, relationshipId, relationship) {
    const relationshipIds =
      this.relationshipIdsByUserId.get(userId) ?? new Set()
    const registration = this.registrations.get(userId)
    const expiresAt = isExpired(registration?.expiresAt)
      ? registrationExpiresAt(this.ttlMs)
      : registration?.expiresAt ?? registrationExpiresAt(this.ttlMs)
    relationshipIds.add(relationshipId)
    this.relationshipIdsByUserId.set(userId, relationshipIds)
    this.relationships.set(`${userId}:${relationshipId}`, {
      ...relationship,
      expiresAt
    })
  }

  async deleteRelationship(userId, relationshipId) {
    this.relationships.delete(`${userId}:${relationshipId}`)

    const relationshipIds = this.relationshipIdsByUserId.get(userId)
    if (!relationshipIds) {
      return
    }

    relationshipIds.delete(relationshipId)
    if (!relationshipIds.size) {
      this.relationshipIdsByUserId.delete(userId)
    }
  }

  async deleteAllRelationships(userId) {
    const relationshipIds =
      this.relationshipIdsByUserId.get(userId) ?? new Set()

    for (const relationshipId of relationshipIds) {
      this.relationships.delete(`${userId}:${relationshipId}`)
    }

    this.relationshipIdsByUserId.delete(userId)
  }
}

export { MemoryRegistrationsStore }
