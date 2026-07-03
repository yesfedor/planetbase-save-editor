import * as p from '@clack/prompts'
import * as core from '../../core/index.js'
import type { SaveDocument } from '../../core/index.js'
import { selectOne } from '../prompts.js'

export async function saveDocument(doc: SaveDocument, sourcePath: string): Promise<void> {
  const strategy = await selectOne('How to save?', [
    { value: 'new-file', label: 'New file', hint: 'writes *_modified.sav, original untouched' },
    { value: 'overwrite', label: 'Overwrite original', hint: 'creates a .bak first' },
  ] as const)

  const result = core.repository.save(doc, sourcePath, strategy as core.SaveStrategy)
  p.log.success(`Saved: ${result.path}`)
  if (result.backupPath) p.log.info(`Backup: ${result.backupPath}`)
}
