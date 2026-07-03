import * as p from '@clack/prompts'
import * as core from '../../core/index.js'
import type { SaveDocument } from '../../core/index.js'
import { selectOne, askText, askInt } from '../prompts.js'

export async function colonyMenu(doc: SaveDocument): Promise<void> {
  const name = core.colony.getName(doc)
  p.note(`Name: ${name || '(none)'}`, 'Colony')

  const action = await selectOne('Colony:', [
    { value: 'rename', label: 'Rename colony' },
    { value: 'landing', label: 'Landing permissions' },
    { value: 'back', label: '← Back' },
  ])

  if (action === 'rename') {
    const next = await askText('New colony name:', name)
    core.colony.rename(doc, next)
    p.log.success(`Renamed to ${next}.`)
  } else if (action === 'landing') {
    const perms = core.colony.getLandingPermissions(doc)
    const keys = Object.keys(perms)
    if (!keys.length) {
      p.log.warn('No landing-permissions node in this save.')
      return
    }
    const key = await selectOne(
      'Which setting?',
      keys.map((k) => ({ value: k, label: k, hint: perms[k] })),
    )
    const isBool = /allowed/i.test(key)
    const value = isBool
      ? await selectOne(`${key}:`, [{ value: 'True', label: 'True' }, { value: 'False', label: 'False' }])
      : String(await askInt(`${key} value:`, { min: 0 }))
    core.colony.setLandingPermission(doc, key, value)
    p.log.success(`${key} = ${value}.`)
  }
}
