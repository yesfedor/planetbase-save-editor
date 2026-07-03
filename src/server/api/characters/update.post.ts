import { defineEventHandler, readBody } from 'h3'
import * as core from '../../../core/index.js'
import { getDoc, projection, createError } from '../../session.js'

interface Body {
  id: string
  name?: string
  spec?: string
  stat?: { field: string; value: string | number }
  pos?: { x: number; y: number; z: number }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const doc = getDoc()
  if (!body?.id) throw createError(400, 'id required')
  if (!core.characters.findById(doc, body.id)) throw createError(404, `Character #${body.id} not found`)

  if (typeof body.name === 'string') core.characters.rename(doc, body.id, body.name)
  if (typeof body.spec === 'string') core.characters.setField(doc, body.id, 'specialization', body.spec)
  if (body.stat) core.characters.setField(doc, body.id, body.stat.field, body.stat.value)
  if (body.pos) core.characters.move(doc, body.id, body.pos)

  return { ok: true, projection: projection() }
})
