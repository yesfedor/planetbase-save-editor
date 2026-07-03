import type { SaveDocument } from '../save/SaveDocument.js'
import type { ConstructionNode, StorageSlot, ResourceNode } from '../types/save.js'
import { asArray, num, mkVal, val } from '../xml/nodes.js'
import { STORAGE_MODULE_TYPE } from '../dictionaries/index.js'

export interface StorageInfo {
  id: string
  moduleType: string
  totalSlots: number
  freeSlots: number
}

export function listStorages(doc: SaveDocument): ConstructionNode[] {
  return doc
    .constructions()
    .filter((c) => c['@_type'] === 'Module' && val(c['module-type']) === STORAGE_MODULE_TYPE)
}

function slotsOf(node: ConstructionNode): StorageSlot[] {
  const rs = node['resource-storage']
  if (!rs) return []
  if (!Array.isArray(rs.slot)) rs.slot = asArray(rs.slot)
  return rs.slot as StorageSlot[]
}

export function storageInfo(node: ConstructionNode): StorageInfo {
  const slots = slotsOf(node)
  const free = slots.filter((s) => !s.resource).length
  return {
    id: val(node.id),
    moduleType: val(node['module-type']),
    totalSlots: slots.length,
    freeSlots: free,
  }
}

export function fillStorage(
  doc: SaveDocument,
  node: ConstructionNode,
  type: string,
  count: number,
): number {
  const slots = slotsOf(node)
  const free = slots.filter((s) => !s.resource)
  const placeCount = Math.min(count, free.length)
  if (placeCount === 0) return 0

  const firstId = doc.allocId(placeCount)
  for (let i = 0; i < placeCount; i++) {
    const slot = free[i]
    const resource: ResourceNode = {
      '@_type': type,
      id: mkVal(firstId + i),
      'trader-id': mkVal('-1'),
      position: structuredClone(slot.position),
      orientation: { '@_x': '0', '@_y': '0', '@_z': '0' },
      state: mkVal('2'),
      location: mkVal('0'),
      subtype: mkVal('0'),
      condition: mkVal('1'),
      durability: mkVal('1'),
    }
    slot.resource = resource
  }
  return placeCount
}
