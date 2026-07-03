import type { SaveDocument } from '../save/SaveDocument.js'
import type { Val } from '../types/save.js'
import { asArray, val, mkVal } from '../xml/nodes.js'

export function list(doc: SaveDocument): string[] {
  const node = doc.sg.techs as { tech?: Val | Val[] } | undefined
  if (!node || !node.tech) return []
  return asArray(node.tech)
    .map((t) => val(t))
    .filter(Boolean)
}

export function set(doc: SaveDocument, ids: string[]): string[] {
  const unique = Array.from(new Set(ids.filter(Boolean)))
  doc.sg.techs = unique.length ? { tech: unique.map((id) => mkVal(id)) } : {}
  return unique
}
