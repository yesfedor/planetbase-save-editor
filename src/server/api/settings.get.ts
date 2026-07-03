import { defineEventHandler } from 'h3'
import { loadSettings, resolveSavesDir } from '../settings.js'

export default defineEventHandler(() => {
  return { settings: loadSettings(), resolved: resolveSavesDir() }
})
