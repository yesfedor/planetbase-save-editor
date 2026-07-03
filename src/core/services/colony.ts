import type { SaveDocument } from '../save/SaveDocument.js'
import type { Val } from '../types/save.js'
import { asArray, val, mkVal } from '../xml/nodes.js'

export function getName(doc: SaveDocument): string {
  const name = doc.sg.colony?.name
  return val(asArray(name)[0])
}

export function rename(doc: SaveDocument, name: string): void {
  const colony = doc.sg.colony
  if (!colony) throw new Error('Colony node not found')
  const existing = asArray(colony.name)
  if (existing.length === 0) {
    colony.name = mkVal(name)
    return
  }
  colony.name = existing.map(() => mkVal(name)) as Val[]
}

export interface LandingPermissions {
  [key: string]: string
}

export function getLandingPermissions(doc: SaveDocument): LandingPermissions {
  const lp = doc.sg['ship-manager']?.['landing-permissions']
  if (!lp) return {}
  const out: LandingPermissions = {}
  for (const [k, v] of Object.entries(lp)) out[k] = val(v as Val)
  return out
}

export function setLandingPermission(doc: SaveDocument, key: string, value: string | number): boolean {
  const lp = doc.sg['ship-manager']?.['landing-permissions']
  if (!lp) return false
  lp[key] = mkVal(value)
  return true
}
