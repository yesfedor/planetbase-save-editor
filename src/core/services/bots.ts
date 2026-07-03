import type { SaveDocument } from '../save/SaveDocument.js'
import type { CharacterNode } from '../types/save.js'
import type { BotSpec } from '../types/domain.js'
import type { SpawnPoint } from './spawn.js'
import { mkVal } from '../xml/nodes.js'
import { BOT_NAME_PREFIX } from '../dictionaries/index.js'

function makeBot(spec: BotSpec, id: number, at: SpawnPoint): CharacterNode {
  return {
    '@_type': 'Bot',
    'status-flags': mkVal('0'),
    'wander-time': mkVal('17.92'),
    'integrity-decay-rate': mkVal('50000'),
    id: mkVal(id),
    position: structuredClone(at.position),
    orientation: structuredClone(at.orientation),
    location: mkVal('1'),
    name: mkVal(`${BOT_NAME_PREFIX[spec]}${id}`),
    specialization: mkVal(spec),
    state: mkVal('0'),
    Condition: mkVal('1'),
    Integrity: mkVal('1'),
  } as CharacterNode
}

export function add(doc: SaveDocument, spec: BotSpec, count: number, at: SpawnPoint): number {
  const list = doc.characters()
  const firstId = doc.allocId(count)
  for (let i = 0; i < count; i++) list.push(makeBot(spec, firstId + i, at))
  return count
}
