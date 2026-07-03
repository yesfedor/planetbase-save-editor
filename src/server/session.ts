import path from 'node:path'
import * as core from '../core/index.js'
import type { SaveDocument } from '../core/index.js'

interface Session {
  doc: SaveDocument
  path: string
  file: string
}

let current: Session | null = null

export function open(filePath: string): Projection {
  const doc = core.repository.load(filePath)
  current = { doc, path: filePath, file: path.basename(filePath) }
  return projection()
}

export function requireSession(): Session {
  if (!current) throw createError(409, 'No save opened')
  return current
}

export function getDoc(): SaveDocument {
  return requireSession().doc
}

export function createError(status: number, message: string): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number }
  err.statusCode = status
  return err
}

export interface Projection {
  file: string
  path: string
  version: string
  colony: { name: string; landing: Record<string, string> }
  counts: Record<string, number>
  hasShip: boolean
  storages: core.storage.StorageInfo[]
  airlocks: { id: string; pos: core.Point3 }[]
  characters: { id: string; kind: string; spec: string; name: string; pos: core.Point3 }[]
  meta: {
    resourceTypes: readonly string[]
    colonistSpecs: readonly string[]
    botSpecs: readonly string[]
    modules: number
  }
}

export function projection(): Projection {
  const s = requireSession()
  const doc = s.doc
  const chars = core.characters.list(doc).map((c) => ({
    id: String((c.id as any)['@_value']),
    kind: String(c['@_type']),
    spec: specOf(c),
    name: String((c.name as any)['@_value']),
    pos: vecOf(c.position),
  }))

  return {
    file: s.file,
    path: s.path,
    version: String(doc.sg['@_version'] ?? '?'),
    colony: {
      name: core.colony.getName(doc),
      landing: core.colony.getLandingPermissions(doc),
    },
    counts: core.resources.counts(doc),
    hasShip: !!doc.sg.ships?.ship,
    storages: core.storage.listStorages(doc).map((st) => core.storage.storageInfo(st)),
    airlocks: core.modules
      .listByType(doc, 'ModuleTypeAirlock')
      .map((m) => core.modules.moduleInfo(m))
      .map((m) => ({ id: m.id, pos: m.position })),
    characters: chars,
    meta: {
      resourceTypes: core.RESOURCE_TYPES,
      colonistSpecs: core.COLONIST_SPECS,
      botSpecs: core.BOT_SPECS,
      modules: core.storage.listStorages(doc).length,
    },
  }
}

function specOf(c: any): string {
  const s = c.specialization
  const one = Array.isArray(s) ? s[0] : s
  return one ? String(one['@_value']) : ''
}

function vecOf(p: any): core.Point3 {
  return { x: Number(p['@_x']), y: Number(p['@_y']), z: Number(p['@_z']) }
}
