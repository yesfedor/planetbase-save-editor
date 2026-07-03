import { defineEventHandler, readBody } from 'h3'
import * as core from '../../../core/index.js'
import { requireSession } from '../../session.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ strategy?: core.SaveStrategy }>(event)
  const strategy: core.SaveStrategy = body?.strategy === 'overwrite' ? 'overwrite' : 'new-file'
  const s = requireSession()
  const result = core.repository.save(s.doc, s.path, strategy)
  return result
})
