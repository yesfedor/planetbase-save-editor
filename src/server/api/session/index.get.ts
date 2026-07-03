import { defineEventHandler } from 'h3'
import { projection } from '../../session.js'

export default defineEventHandler(() => {
  return projection()
})
