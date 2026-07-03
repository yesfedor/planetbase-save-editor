import type { SaveDocument } from '../save/SaveDocument.js'
import type { ConstructionNode } from '../types/save.js'
import type { Point3 } from '../types/domain.js'
import { val, vec3 } from '../xml/nodes.js'

export function listByType(doc: SaveDocument, moduleType: string): ConstructionNode[] {
  return doc
    .constructions()
    .filter((c) => c['@_type'] === 'Module' && val(c['module-type']) === moduleType)
}

export interface ModuleInfo {
  id: string
  moduleType: string
  position: Point3
}

export function moduleInfo(node: ConstructionNode): ModuleInfo {
  return { id: val(node.id), moduleType: val(node['module-type']), position: vec3(node.position) }
}

export function findById(doc: SaveDocument, id: string): ConstructionNode | undefined {
  return doc.constructions().find((c) => val(c.id) === id)
}
