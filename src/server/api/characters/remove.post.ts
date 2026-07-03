import { defineEventHandler, readBody } from 'h3'
import * as core from '../../../core/index.js'
import { getDoc, projection, createError } from '../../session.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ id: string }>(event)
  if (!body?.id) throw createError(400, 'id required')
  const ok = core.characters.remove(getDoc(), body.id)
  if (!ok) throw createError(404, `Character #${body.id} not found`)
  return { ok, projection: projection() }
})
