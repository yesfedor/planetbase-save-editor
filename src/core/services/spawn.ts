import type { SaveDocument } from '../save/SaveDocument.js'
import type { Vec3 } from '../types/save.js'
import type { Point3 } from '../types/domain.js'
import { mkVec3 } from '../xml/nodes.js'

export interface SpawnPoint {
  position: Vec3
  orientation: Vec3
}

function clone<T>(v: T): T {
  return structuredClone(v)
}

export function shipSpawn(doc: SaveDocument): SpawnPoint {
  const ship = doc.sg.ships?.ship
  if (!ship) throw new Error('Colony Ship not found in this save')
  return { position: clone(ship.position), orientation: clone(ship.orientation) }
}

export function cameraSpawn(doc: SaveDocument): SpawnPoint {
  const cam = doc.sg.camera
  if (!cam) throw new Error('Camera position not found in this save')
  const position = clone(cam.position)
  const orientation = clone(cam.orientation)
  position['@_y'] = '0'
  orientation['@_y'] = '0'
  return { position, orientation }
}

export function coordsSpawn(p: Point3): SpawnPoint {
  return { position: mkVec3(p), orientation: mkVec3({ x: 0, y: 0, z: 0 }) }
}

export function moduleSpawn(doc: SaveDocument, moduleId: string): SpawnPoint {
  const node = doc.constructions().find((c) => String((c.id as any)['@_value']) === moduleId)
  if (!node) throw new Error(`Module #${moduleId} not found`)
  return { position: clone(node.position), orientation: clone(node.orientation) }
}

export function offsetForEntity(point: SpawnPoint): SpawnPoint {
  const position = clone(point.position)
  position['@_x'] = Number(position['@_x']) + 0.05
  position['@_z'] = Number(position['@_z']) + 0.05
  const orientation = clone(point.orientation)
  orientation['@_x'] = '0'
  orientation['@_z'] = 0
  return { position, orientation }
}
