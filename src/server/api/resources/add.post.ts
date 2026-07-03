import { defineEventHandler, readBody } from 'h3'
import { getDoc } from '../../session.js'
import { addResources, type TargetBody } from '../../apply.js'
import { projection } from '../../session.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ type: string; count: number; target: TargetBody }>(event)
  const result = addResources(getDoc(), body.type, Number(body.count), body.target)
  return { result, projection: projection() }
})
