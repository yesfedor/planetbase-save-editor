import type { SaveDocument } from '../save/SaveDocument.js'
import type { ConstructionNode, StorageSlot, ResourceNode, Vec3 } from '../types/save.js'
import { asArray, num, mkVal, val } from '../xml/nodes.js'
import { STORAGE_MODULE_TYPE, resourceHeight } from '../dictionaries/index.js'

export interface StorageInfo {
  id: string
  moduleType: string
  totalSlots: number
  usedHeight: number
  budgetHeight: number
  fillPercent: number
  full: boolean
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

function usedHeightOf(slot: StorageSlot): number {
  return asArray(slot.resource).reduce((a, r) => a + resourceHeight(r['@_type']), 0)
}

export function storageInfo(node: ConstructionNode): StorageInfo {
  const slots = slotsOf(node)
  let used = 0
  let budget = 0
  for (const s of slots) {
    budget += num(s['max-height'])
    used += usedHeightOf(s)
  }
  return {
    id: val(node.id),
    moduleType: val(node['module-type']),
    totalSlots: slots.length,
    usedHeight: Math.round(used * 10) / 10,
    budgetHeight: Math.round(budget * 10) / 10,
    fillPercent: budget > 0 ? Math.min(100, Math.round((used / budget) * 100)) : 0,
    full: budget - used < 0.45,
  }
}

export function freeCapacity(node: ConstructionNode, type: string): number {
  const h = resourceHeight(type)
  let cap = 0
  for (const slot of slotsOf(node)) {
    const remaining = num(slot['max-height']) - usedHeightOf(slot)
    cap += Math.max(0, Math.floor(remaining / h))
  }
  return cap
}

function makeStorageResource(type: string, id: number, pos: Vec3, y: number): ResourceNode {
  return {
    '@_type': type,
    id: mkVal(id),
    'trader-id': mkVal('-1'),
    position: { '@_x': pos['@_x'], '@_y': Math.round(y * 10000) / 10000, '@_z': pos['@_z'] },
    orientation: { '@_x': '0', '@_y': '0', '@_z': '0' },
    state: mkVal('2'),
    location: mkVal('0'),
    subtype: mkVal('0'),
    condition: mkVal('1'),
    durability: mkVal('1'),
  }
}

export function fillStorage(doc: SaveDocument, node: ConstructionNode, type: string, count: number): number {
  const h = resourceHeight(type)
  const slots = slotsOf(node)

  const plan = slots.map((slot) => {
    const used = usedHeightOf(slot)
    const fit = Math.max(0, Math.floor((num(slot['max-height']) - used) / h))
    return { slot, used, fit }
  })
  const capacity = plan.reduce((a, s) => a + s.fit, 0)
  const toPlace = Math.min(count, capacity)
  if (toPlace === 0) return 0

  let id = doc.allocId(toPlace)
  let placed = 0
  for (const { slot, used, fit } of plan) {
    if (placed >= toPlace) break
    const add = Math.min(fit, toPlace - placed)
    if (add === 0) continue
    const list = asArray(slot.resource)
    const baseY = Number(slot.position['@_y'])
    for (let i = 0; i < add; i++) {
      const y = baseY + used + h * i + h / 2
      list.push(makeStorageResource(type, id++, slot.position, y))
      placed++
    }
    slot.resource = list.length === 1 ? list[0] : list
  }
  return placed
}
