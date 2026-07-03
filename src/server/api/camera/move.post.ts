import { defineEventHandler, readBody } from 'h3'
import * as core from '../../../core/index.js'
import { getDoc, createError } from '../../session.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ x: number; y: number; z: number }>(event)
  const ok = core.camera.move(getDoc(), { x: Number(body.x), y: Number(body.y), z: Number(body.z) })
  if (!ok) throw createError(400, 'No camera node in this save')
  return { ok }
})
