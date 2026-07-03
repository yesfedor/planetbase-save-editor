import { defineEventHandler, readBody } from 'h3'
import * as core from '../../../core/index.js'
import { getDoc, projection, createError } from '../../session.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ techs: string[] }>(event)
  if (!Array.isArray(body?.techs)) throw createError(400, 'techs array required')
  const allowed = new Set(core.dictionaries.TECH_IDS)
  const ids = body.techs.filter((t) => allowed.has(t))
  core.techs.set(getDoc(), ids)
  return { techs: ids, projection: projection() }
})
