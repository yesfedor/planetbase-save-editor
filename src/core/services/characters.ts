import type { SaveDocument } from '../save/SaveDocument.js'
import type { CharacterNode, Vec3 } from '../types/save.js'
import { val, mkVal, num } from '../xml/nodes.js'
import type { Point3 } from '../types/domain.js'

export type CharacterKind = 'Colonist' | 'Bot'

export function list(doc: SaveDocument, kind?: CharacterKind): CharacterNode[] {
  const all = doc.characters()
  return kind ? all.filter((c) => c['@_type'] === kind) : all
}

export function findById(doc: SaveDocument, id: string): CharacterNode | undefined {
  return doc.characters().find((c) => val(c.id) === id)
}

export function rename(doc: SaveDocument, id: string, name: string): boolean {
  const c = findById(doc, id)
  if (!c) return false
  c.name = mkVal(name)
  return true
}

export function remove(doc: SaveDocument, id: string): boolean {
  const list = doc.characters()
  const next = list.filter((c) => val(c.id) !== id)
  if (next.length === list.length) return false
  doc.setCharacters(next)
  return true
}

export function move(doc: SaveDocument, id: string, p: Point3): boolean {
  const c = findById(doc, id)
  if (!c) return false
  const pos = c.position as Vec3
  pos['@_x'] = p.x
  pos['@_y'] = p.y
  pos['@_z'] = p.z
  return true
}

export function setField(doc: SaveDocument, id: string, field: string, value: string | number): boolean {
  const c = findById(doc, id)
  if (!c) return false
  c[field] = mkVal(value)
  return true
}
