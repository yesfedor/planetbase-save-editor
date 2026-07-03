import { defineEventHandler } from 'h3'
import * as core from '../../core/index.js'
import { resolveSavesDir } from '../settings.js'

export default defineEventHandler(() => {
  const resolved = resolveSavesDir()
  if (!resolved.exists) return { dir: resolved.dir, files: [], error: 'Directory does not exist' }
  const files = core.repository.listSaves(resolved.dir)
  return { dir: resolved.dir, files }
})
