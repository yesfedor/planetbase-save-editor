import type { SaveDocument } from '../save/SaveDocument.js'
import type { CharacterNode } from '../types/save.js'
import type { ColonistSpec } from '../types/domain.js'
import type { SpawnPoint } from './spawn.js'
import { mkVal } from '../xml/nodes.js'

function makeColonist(spec: ColonistSpec, id: number, at: SpawnPoint): CharacterNode {
  return {
    '@_type': 'Colonist',
    'status-flags': mkVal('0'),
    'wander-time': mkVal('17.92'),
    'basic-meal-count': mkVal('0'),
    'head-index': mkVal('3'),
    'skin-color-index': mkVal('2'),
    'hair-color-index': mkVal('8'),
    'inmunity-to-contagion-time': mkVal('0'),
    id: mkVal(id),
    position: structuredClone(at.position),
    orientation: structuredClone(at.orientation),
    location: mkVal('1'),
    name: mkVal(`${spec} ${id}`),
    specialization: mkVal(spec),
    state: mkVal('0'),
    Health: mkVal('1'),
    Nutrition: mkVal('1'),
    Hydration: mkVal('1'),
    Oxygen: mkVal('1'),
    Sleep: mkVal('1'),
    Morale: mkVal('1'),
    Gendre: mkVal(Math.floor(Math.random() * 2)),
    doctor: mkVal('False'),
  } as CharacterNode
}

export function add(doc: SaveDocument, spec: ColonistSpec, count: number, at: SpawnPoint): number {
  const list = doc.characters()
  const firstId = doc.allocId(count)
  for (let i = 0; i < count; i++) list.push(makeColonist(spec, firstId + i, at))
  return count
}
