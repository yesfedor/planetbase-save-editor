import * as p from '@clack/prompts'
import * as core from '../../core/index.js'
import type { SaveDocument } from '../../core/index.js'
import { selectOne, askInt } from '../prompts.js'
import { chooseResourceTarget } from './spawn.js'

async function pickResourceType(): Promise<string> {
  return selectOne(
    'Select resource type:',
    core.RESOURCE_TYPES.map((t) => ({ value: t, label: t })),
  )
}

async function addResources(doc: SaveDocument): Promise<void> {
  const type = await pickResourceType()
  const target = await chooseResourceTarget(doc)
  const count = await askInt(`How many ${type} to add?`, { min: 1 })

  let placed = 0
  if (target.kind === 'ship') placed = core.resources.addToShip(doc, type, count)
  else if (target.kind === 'ground') placed = core.resources.addToGround(doc, type, count, target.at)
  else {
    placed = core.resources.addToStorage(doc, type, count, target.moduleId)
    if (placed < count) p.log.warn(`Storage had ${target.free} free slots — placed ${placed}, dropped ${count - placed}.`)
  }

  p.log.success(`Added ${placed} ${type}.`)
}

async function removeResources(doc: SaveDocument): Promise<void> {
  const type = await pickResourceType()
  const scope = await selectOne('Remove from:', [
    { value: 'all', label: 'Everywhere', hint: 'ground + ship' },
    { value: 'ground', label: 'Ground only' },
    { value: 'ship', label: 'Ship only' },
  ] as const)
  const removed = core.resources.removeAllByType(doc, type, scope as 'all' | 'ground' | 'ship')
  p.log.success(`Removed ${removed} ${type}.`)
}

export async function resourcesMenu(doc: SaveDocument): Promise<void> {
  const counts = core.resources.counts(doc)
  const summary = Object.entries(counts)
    .map(([t, n]) => `${t}: ${n}`)
    .join('   ')
  p.note(summary || 'no resources', 'Current resources')

  const action = await selectOne('Resources:', [
    { value: 'add', label: 'Add resources' },
    { value: 'remove', label: 'Remove all by type' },
    { value: 'back', label: '← Back' },
  ])

  if (action === 'add') await addResources(doc)
  else if (action === 'remove') await removeResources(doc)
}
