import * as p from '@clack/prompts'
import * as core from '../../core/index.js'
import type { SaveDocument } from '../../core/index.js'
import type { CharacterKind } from '../../core/services/characters.js'
import { selectOne, askInt, askText } from '../prompts.js'
import { chooseEntitySpawn } from './spawn.js'

const SPECS: Record<CharacterKind, readonly string[]> = {
  Colonist: core.COLONIST_SPECS,
  Bot: core.BOT_SPECS,
}

const STAT_FIELDS: Record<CharacterKind, string[]> = {
  Colonist: ['Health', 'Nutrition', 'Hydration', 'Oxygen', 'Sleep', 'Morale'],
  Bot: ['Condition', 'Integrity'],
}

async function addEntity(doc: SaveDocument, kind: CharacterKind): Promise<void> {
  const spec = await selectOne(
    `Select ${kind} type:`,
    SPECS[kind].map((s) => ({ value: s, label: s })),
  )
  const at = await chooseEntitySpawn(doc)
  const count = await askInt(`How many ${spec} to add?`, { min: 1 })
  const added = kind === 'Colonist'
    ? core.colonists.add(doc, spec as core.ColonistSpec, count, at)
    : core.bots.add(doc, spec as core.BotSpec, count, at)
  p.log.success(`Added ${added} ${spec}.`)
}

async function pickEntity(doc: SaveDocument, kind: CharacterKind): Promise<string | null> {
  const list = core.characters.list(doc, kind)
  if (!list.length) {
    p.log.warn(`No ${kind}s in this save.`)
    return null
  }
  return selectOne(
    `Select ${kind}:`,
    list.map((c) => ({
      value: String(c.id['@_value']),
      label: `${String(c.name['@_value'])}`,
      hint: `#${String(c.id['@_value'])}`,
    })),
  )
}

async function editEntity(doc: SaveDocument, kind: CharacterKind): Promise<void> {
  const id = await pickEntity(doc, kind)
  if (!id) return
  const field = await selectOne('Edit what?', [
    { value: 'name', label: 'Rename' },
    { value: 'spec', label: 'Change specialization' },
    { value: 'stat', label: 'Set a stat value' },
    { value: 'remove', label: 'Delete' },
  ])

  if (field === 'name') {
    const name = await askText('New name:')
    core.characters.rename(doc, id, name)
    p.log.success('Renamed.')
  } else if (field === 'spec') {
    const spec = await selectOne('New specialization:', SPECS[kind].map((s) => ({ value: s, label: s })))
    core.characters.setField(doc, id, 'specialization', spec)
    p.log.success('Specialization changed.')
  } else if (field === 'stat') {
    const stat = await selectOne('Which stat?', STAT_FIELDS[kind].map((s) => ({ value: s, label: s })))
    const raw = await askText(`${stat} value (0..1):`, '1')
    core.characters.setField(doc, id, stat, raw)
    p.log.success(`${stat} = ${raw}.`)
  } else {
    core.characters.remove(doc, id)
    p.log.success('Deleted.')
  }
}

export async function entityMenu(doc: SaveDocument, kind: CharacterKind): Promise<void> {
  const total = core.characters.list(doc, kind).length
  p.note(`${total} ${kind}(s)`, `${kind} management`)

  const action = await selectOne(`${kind}s:`, [
    { value: 'add', label: `Add ${kind}` },
    { value: 'edit', label: `Edit / delete ${kind}` },
    { value: 'back', label: '← Back' },
  ])

  if (action === 'add') await addEntity(doc, kind)
  else if (action === 'edit') await editEntity(doc, kind)
}
