import { defineEventHandler, readBody } from 'h3'
import * as core from '../../../core/index.js'
import { getDoc, projection } from '../../session.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ type: string; scope?: 'ground' | 'ship' | 'storage' | 'all'; count?: number }>(event)
  const scope = body.scope ?? 'all'
  const count = typeof body.count === 'number' && body.count > 0 ? Math.floor(body.count) : Infinity
  const removed = core.resources.removeByType(getDoc(), body.type, count, scope)
  return { removed, projection: projection() }
})
