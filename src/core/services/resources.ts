import type { SaveDocument } from '../save/SaveDocument.js'
import type { ResourceNode } from '../types/save.js'
import type { SpawnPoint } from './spawn.js'
import { asArray, num, mkVal, val } from '../xml/nodes.js'
import { listStorages, fillStorage } from './storage.js'

function makeResource(type: string, id: number, at: SpawnPoint): ResourceNode {
  return {
    '@_type': type,
    'trader-id': mkVal('-1'),
    id: mkVal(id),
    position: structuredClone(at.position),
    orientation: structuredClone(at.orientation),
    state: mkVal('0'),
    location: mkVal('1'),
    subtype: mkVal('0'),
    condition: mkVal('1'),
    durability: mkVal('1'),
  }
}

export function addToGround(doc: SaveDocument, type: string, count: number, at: SpawnPoint): number {
  const list = doc.groundResources()
  const firstId = doc.allocId(count)
  for (let i = 0; i < count; i++) list.push(makeResource(type, firstId + i, at))
  return count
}

export function addToShip(doc: SaveDocument, type: string, count: number): number {
  const ship = doc.sg.ships?.ship
  if (!ship) throw new Error('Colony Ship not found in this save')
  const container = ship['resource-container']
  if (!Array.isArray(container.resource)) container.resource = asArray(container.resource)
  const list = container.resource as ResourceNode[]

  const at: SpawnPoint = { position: ship.position, orientation: ship.orientation }
  const firstId = doc.allocId(count)
  for (let i = 0; i < count; i++) list.push(makeResource(type, firstId + i, at))

  container.capacity = mkVal(num(container.capacity) + count + 10)
  return count
}

export function addToStorage(doc: SaveDocument, type: string, count: number, moduleId: string): number {
  const node = listStorages(doc).find((s) => val(s.id) === moduleId)
  if (!node) throw new Error(`Storage module #${moduleId} not found`)
  return fillStorage(doc, node, type, count)
}

export function removeAllByType(
  doc: SaveDocument,
  type: string,
  scope: 'ground' | 'ship' | 'all' = 'all',
): number {
  let removed = 0

  if (scope === 'ground' || scope === 'all') {
    const list = doc.groundResources()
    const before = list.length
    doc.setGroundResources(list.filter((r) => r['@_type'] !== type))
    removed += before - doc.groundResources().length
  }

  if (scope === 'ship' || scope === 'all') {
    const ship = doc.sg.ships?.ship
    const container = ship?.['resource-container']
    if (container?.resource) {
      const list = asArray(container.resource)
      const before = list.length
      container.resource = list.filter((r) => r['@_type'] !== type)
      removed += before - asArray(container.resource).length
    }
  }

  return removed
}

export function removeByType(
  doc: SaveDocument,
  type: string,
  count: number,
  scope: 'ground' | 'ship' | 'storage' | 'all' = 'all',
): number {
  let remaining = count
  let removed = 0
  const take = (r: ResourceNode): boolean => {
    if (remaining > 0 && r['@_type'] === type) {
      remaining--
      removed++
      return false
    }
    return true
  }

  if ((scope === 'ground' || scope === 'all') && remaining > 0) {
    doc.setGroundResources(doc.groundResources().filter(take))
  }

  if ((scope === 'ship' || scope === 'all') && remaining > 0) {
    const container = doc.sg.ships?.ship?.['resource-container']
    if (container?.resource) container.resource = asArray(container.resource).filter(take)
  }

  if ((scope === 'storage' || scope === 'all') && remaining > 0) {
    for (const s of listStorages(doc)) {
      const rs = s['resource-storage']
      if (!rs) continue
      for (const slot of asArray(rs.slot)) {
        if (remaining <= 0) break
        if (!slot.resource) continue
        const kept = asArray(slot.resource).filter(take)
        if (kept.length === 0) delete slot.resource
        else slot.resource = kept.length === 1 ? kept[0] : kept
      }
    }
  }

  return removed
}

export function counts(doc: SaveDocument): Record<string, number> {
  const acc: Record<string, number> = {}
  const bump = (t: string) => {
    acc[t] = (acc[t] || 0) + 1
  }

  for (const r of doc.groundResources()) bump(r['@_type'])

  const ship = doc.sg.ships?.ship
  if (ship?.['resource-container']?.resource) {
    for (const r of asArray(ship['resource-container'].resource)) bump(r['@_type'])
  }

  for (const s of listStorages(doc)) {
    const rs = s['resource-storage']
    if (!rs) continue
    for (const slot of asArray(rs.slot)) {
      for (const r of asArray(slot.resource)) bump(r['@_type'])
    }
  }

  return acc
}
