import * as core from '../core/index.js'
import type { SaveDocument, SpawnPoint } from '../core/index.js'
import { createError } from './session.js'

export interface TargetBody {
  kind: 'ship' | 'camera' | 'coords' | 'storage' | 'airlock'
  x?: number
  y?: number
  z?: number
  moduleId?: string
}

function pointFrom(doc: SaveDocument, body: TargetBody): SpawnPoint {
  if (body.kind === 'ship') return core.spawn.shipSpawn(doc)
  if (body.kind === 'camera') return core.spawn.cameraSpawn(doc)
  if (body.kind === 'airlock') {
    if (!body.moduleId) throw createError(400, 'moduleId required')
    return core.spawn.moduleSpawn(doc, body.moduleId)
  }
  return core.spawn.coordsSpawn({ x: Number(body.x) || 0, y: Number(body.y) || 0, z: Number(body.z) || 0 })
}

export function addResources(
  doc: SaveDocument,
  type: string,
  count: number,
  target: TargetBody,
): { placed: number; dropped: number } {
  if (!core.RESOURCE_TYPES.includes(type as any)) throw createError(400, `Unknown resource type: ${type}`)
  if (!Number.isInteger(count) || count < 1) throw createError(400, 'count must be a positive integer')

  let placed = 0
  if (target.kind === 'ship') placed = core.resources.addToShip(doc, type, count)
  else if (target.kind === 'storage') {
    if (!target.moduleId) throw createError(400, 'moduleId required')
    placed = core.resources.addToStorage(doc, type, count, target.moduleId)
  } else placed = core.resources.addToGround(doc, type, count, pointFrom(doc, target))

  return { placed, dropped: count - placed }
}

export function resolveEntitySpawn(doc: SaveDocument, body: TargetBody): SpawnPoint {
  return core.spawn.offsetForEntity(pointFrom(doc, body))
}
