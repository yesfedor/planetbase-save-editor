import { defineEventHandler, readBody } from 'h3'
import * as core from '../../../core/index.js'
import { getDoc, projection, createError } from '../../session.js'
import { resolveEntitySpawn, type TargetBody } from '../../apply.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ spec: string; count: number; spawn: TargetBody }>(event)
  if (!core.BOT_SPECS.includes(body.spec as any)) throw createError(400, `Unknown bot spec: ${body.spec}`)
  const count = Number(body.count)
  if (!Number.isInteger(count) || count < 1) throw createError(400, 'count must be a positive integer')
  const at = resolveEntitySpawn(getDoc(), body.spawn)
  const added = core.bots.add(getDoc(), body.spec as core.BotSpec, count, at)
  return { added, projection: projection() }
})
