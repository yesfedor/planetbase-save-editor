import { defineEventHandler, readBody } from 'h3'
import { open, createError } from '../../session.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ path?: string }>(event)
  if (!body?.path) throw createError(400, 'path required')
  return open(body.path)
})
