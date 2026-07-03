export interface StorageInfo {
  id: string
  moduleType: string
  totalSlots: number
  freeSlots: number
}

export interface CharacterView {
  id: string
  kind: string
  spec: string
  name: string
  pos: { x: number; y: number; z: number }
}

export interface Projection {
  file: string
  path: string
  version: string
  colony: { name: string; landing: Record<string, string> }
  counts: Record<string, number>
  hasShip: boolean
  storages: StorageInfo[]
  airlocks: { id: string; pos: { x: number; y: number; z: number } }[]
  characters: CharacterView[]
  meta: {
    resourceTypes: string[]
    colonistSpecs: string[]
    botSpecs: string[]
    modules: number
  }
}

export interface MapObject {
  kind: 'module' | 'connection' | 'colonist' | 'bot' | 'resource' | 'camera'
  id: string
  type: string
  position: { x: number; y: number; z: number }
  orientation: { x: number; y: number; z: number }
}

export type SaveMode = 'project' | 'game' | 'custom'

export interface ResolvedDirs {
  dir: string
  mode: SaveMode
  exists: boolean
  projectDir: string
  gameDir: string
  gameExists: boolean
  customDir: string
}

async function req<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok || json?.error) throw new Error(json?.message || `Request failed: ${res.status}`)
  return json as T
}

export const api = {
  getSettings: () => req<{ settings: { mode: SaveMode; customDir: string }; resolved: ResolvedDirs }>('/api/settings'),
  setSettings: (payload: { mode: SaveMode; customDir?: string }) => req<{ resolved: ResolvedDirs }>('/api/settings', payload),
  listSaves: () => req<{ dir: string; files: { name: string; path: string }[]; error?: string }>('/api/saves'),
  open: (path: string) => req<Projection>('/api/session/open', { path }),
  session: () => req<Projection>('/api/session'),
  save: (strategy: 'new-file' | 'overwrite') => req<{ path: string; backupPath?: string }>('/api/session/save', { strategy }),
  map: () => req<{ objects: MapObject[]; counts: Record<string, number> }>('/api/map'),

  addResources: (type: string, count: number, target: unknown) =>
    req<{ result: { placed: number; dropped: number }; projection: Projection }>('/api/resources/add', { type, count, target }),
  removeResources: (type: string, scope: 'ground' | 'ship' | 'storage' | 'all', count?: number) =>
    req<{ removed: number; projection: Projection }>('/api/resources/remove', { type, scope, count }),
  addColonists: (spec: string, count: number, spawn: unknown) =>
    req<{ added: number; projection: Projection }>('/api/colonists/add', { spec, count, spawn }),
  addBots: (spec: string, count: number, spawn: unknown) =>
    req<{ added: number; projection: Projection }>('/api/bots/add', { spec, count, spawn }),
  updateCharacter: (payload: Record<string, unknown>) =>
    req<{ projection: Projection }>('/api/characters/update', payload),
  removeCharacter: (id: string) => req<{ projection: Projection }>('/api/characters/remove', { id }),
  moveCamera: (x: number, y: number, z: number) => req<{ ok: boolean }>('/api/camera/move', { x, y, z }),
  renameColony: (name: string) => req<{ projection: Projection }>('/api/colony/rename', { name }),
  setLanding: (key: string, value: string | number) => req<{ projection: Projection }>('/api/colony/landing', { key, value }),
}
