import { defineEventHandler } from 'h3'
import * as core from '../../core/index.js'
import { getDoc } from '../session.js'

export default defineEventHandler(() => {
  return core.worldMap.snapshot(getDoc())
})
