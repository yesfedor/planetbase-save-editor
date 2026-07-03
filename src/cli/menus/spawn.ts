import * as core from '../../core/index.js'
import type { SaveDocument, SpawnPoint } from '../../core/index.js'
import { selectOne, askFloat } from '../prompts.js'

export type ResourceTarget =
  | { kind: 'ship' }
  | { kind: 'ground'; at: SpawnPoint }
  | { kind: 'storage'; moduleId: string; free: number }

async function coordsPoint(): Promise<SpawnPoint> {
  const x = await askFloat('X coordinate:')
  const y = await askFloat('Y coordinate (0 = ground):')
  const z = await askFloat('Z coordinate:')
  return core.spawn.coordsSpawn({ x, y, z })
}

export async function chooseResourceTarget(doc: SaveDocument): Promise<ResourceTarget> {
  const hasShip = !!doc.sg.ships?.ship
  const storages = core.storage.listStorages(doc)

  const options: { value: string; label: string; hint?: string }[] = []
  if (hasShip) options.push({ value: 'ship', label: 'Colony Ship', hint: 'into ship container' })
  options.push({ value: 'camera', label: 'Under camera', hint: 'on the ground' })
  options.push({ value: 'coords', label: 'Coordinates', hint: 'on the ground (X/Y/Z)' })
  if (storages.length) options.push({ value: 'storage', label: `Storage module (${storages.length})`, hint: 'fills free slots' })

  const choice = await selectOne('Where to place resources?', options)

  if (choice === 'ship') return { kind: 'ship' }
  if (choice === 'camera') return { kind: 'ground', at: core.spawn.cameraSpawn(doc) }
  if (choice === 'coords') return { kind: 'ground', at: await coordsPoint() }

  const info = storages.map((s) => core.storage.storageInfo(s))
  const moduleId = await selectOne(
    'Select storage module:',
    info.map((i) => ({ value: i.id, label: `#${i.id}`, hint: `${i.freeSlots}/${i.totalSlots} free` })),
  )
  const picked = info.find((i) => i.id === moduleId)!
  return { kind: 'storage', moduleId, free: picked.freeSlots }
}

export async function chooseEntitySpawn(doc: SaveDocument): Promise<SpawnPoint> {
  const hasShip = !!doc.sg.ships?.ship
  const options: { value: string; label: string; hint?: string }[] = []
  if (hasShip) options.push({ value: 'ship', label: 'Colony Ship', hint: 'next to the ship' })
  options.push({ value: 'camera', label: 'Under camera' })
  options.push({ value: 'coords', label: 'Coordinates' })

  const choice = await selectOne('Where to spawn?', options)
  if (choice === 'ship') return core.spawn.offsetForEntity(core.spawn.shipSpawn(doc))
  if (choice === 'camera') return core.spawn.offsetForEntity(core.spawn.cameraSpawn(doc))
  return core.spawn.offsetForEntity(await coordsPoint())
}
