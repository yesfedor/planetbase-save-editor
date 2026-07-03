import { defineEventHandler, readBody } from 'h3'
import * as core from '../../../core/index.js'
import { getDoc, projection, createError } from '../../session.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ key: string; value: string | number }>(event)
  if (!body?.key) throw createError(400, 'key required')
  const ok = core.colony.setLandingPermission(getDoc(), body.key, body.value)
  if (!ok) throw createError(400, 'No landing-permissions in this save')
  return { ok, projection: projection() }
})
