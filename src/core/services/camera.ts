import type { SaveDocument } from '../save/SaveDocument.js'
import type { Point3 } from '../types/domain.js'
import { vec3 } from '../xml/nodes.js'

export function getPosition(doc: SaveDocument): Point3 | null {
  const cam = doc.sg.camera
  return cam?.position ? vec3(cam.position) : null
}

export function move(doc: SaveDocument, p: Point3): boolean {
  const cam = doc.sg.camera
  if (!cam?.position) return false
  cam.position['@_x'] = p.x
  cam.position['@_y'] = p.y
  cam.position['@_z'] = p.z
  return true
}
