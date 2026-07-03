import { defineEventHandler, readBody } from 'h3'
import { saveSettings, resolveSavesDir, type SaveMode } from '../settings.js'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ mode?: SaveMode; customDir?: string }>(event)
  saveSettings({ mode: (body?.mode ?? 'project') as SaveMode, customDir: body?.customDir ?? '' })
  return { settings: undefined, resolved: resolveSavesDir() }
})
