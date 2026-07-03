import { defineEventHandler, readBody } from 'h3'
import * as core from '../../../core/index.js'
import { getDoc, projection, createError } from '../../session.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string }>(event)
  if (!body?.name || !body.name.trim()) throw createError(400, 'name required')
  core.colony.rename(getDoc(), body.name.trim())
  return { ok: true, projection: projection() }
})
