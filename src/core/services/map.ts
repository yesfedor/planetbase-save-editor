import type { SaveDocument } from '../save/SaveDocument.js'
import type { MapObject, MapSnapshot } from '../types/domain.js'
import { asArray, val, vec3 } from '../xml/nodes.js'

export function snapshot(doc: SaveDocument): MapSnapshot {
  const objects: MapObject[] = []
  const counts: Record<string, number> = {}
  const bump = (k: string) => {
    counts[k] = (counts[k] || 0) + 1
  }

  for (const c of doc.constructions()) {
    const kind = c['@_type'] === 'Connection' ? 'connection' : 'module'
    objects.push({
      kind,
      id: val(c.id),
      type: val(c['module-type']) || c['@_type'],
      position: vec3(c.position),
      orientation: vec3(c.orientation),
    })
    bump(kind)
  }

  for (const ch of doc.characters()) {
    const kind = ch['@_type'] === 'Bot' ? 'bot' : 'colonist'
    objects.push({
      kind,
      id: val(ch.id),
      type: val(ch.specialization as any) || ch['@_type'],
      position: vec3(ch.position),
      orientation: vec3(ch.orientation),
    })
    bump(kind)
  }

  for (const r of doc.groundResources()) {
    objects.push({
      kind: 'resource',
      id: val(r.id),
      type: r['@_type'],
      position: vec3(r.position),
      orientation: vec3(r.orientation),
    })
    bump('resource')
  }

  const cam = doc.sg.camera
  if (cam?.position) {
    objects.push({
      kind: 'camera',
      id: 'camera',
      type: 'Camera',
      position: vec3(cam.position),
      orientation: vec3(cam.orientation),
    })
    bump('camera')
  }

  return { objects, counts }
}
