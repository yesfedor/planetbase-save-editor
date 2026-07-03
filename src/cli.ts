import { fileURLToPath } from 'node:url'
import path from 'node:path'
import * as p from '@clack/prompts'
import * as core from './core/index.js'
import { selectOne } from './cli/prompts.js'
import { resourcesMenu } from './cli/menus/resources.js'
import { entityMenu } from './cli/menus/entities.js'
import { colonyMenu } from './cli/menus/colony.js'
import { saveDocument } from './cli/menus/save.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SAVES_DIR = path.join(__dirname, '..', 'saves')

async function pickSaveFile(): Promise<core.SaveFile> {
  const files = core.repository.listSaves(SAVES_DIR)
  if (!files.length) {
    p.log.error(`No .sav files found in ${SAVES_DIR}`)
    process.exit(1)
  }
  const chosen = await selectOne(
    'Select a save file:',
    files.map((f) => ({ value: f.path, label: f.name })),
  )
  return files.find((f) => f.path === chosen)!
}

async function main(): Promise<void> {
  console.clear()
  p.intro('PlanetBase Save Editor')

  const file = await pickSaveFile()
  const doc = core.repository.load(file.path)
  p.log.info(`Loaded ${file.name} — v${String(doc.sg['@_version'] ?? '?')}`)

  let running = true
  while (running) {
    const action = await selectOne('Main menu:', [
      { value: 'resources', label: 'Resource management' },
      { value: 'colonist', label: 'Colonist management' },
      { value: 'bot', label: 'Bot management' },
      { value: 'colony', label: 'Colony settings' },
      { value: 'save', label: 'Save…' },
      { value: 'exit', label: 'Exit' },
    ])

    switch (action) {
      case 'resources':
        await resourcesMenu(doc)
        break
      case 'colonist':
        await entityMenu(doc, 'Colonist')
        break
      case 'bot':
        await entityMenu(doc, 'Bot')
        break
      case 'colony':
        await colonyMenu(doc)
        break
      case 'save':
        await saveDocument(doc, file.path)
        break
      case 'exit':
        running = false
        break
    }
  }

  p.outro('Done')
}

main().catch((err) => {
  p.log.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
