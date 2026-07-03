import type { Val, Vec3 } from '../types/save.js'
import type { Point3 } from '../types/domain.js'

export function asArray<T>(node: T | T[] | undefined | null): T[] {
  if (node === undefined || node === null) return []
  return Array.isArray(node) ? node : [node]
}

export function val(v: Val | undefined): string {
  if (!v) return ''
  return String(v['@_value'])
}

export function num(v: Val | undefined): number {
  return Number(val(v))
}

export function mkVal(value: string | number): Val {
  return { '@_value': value }
}

export function vec3(p: Vec3): Point3 {
  return { x: Number(p['@_x']), y: Number(p['@_y']), z: Number(p['@_z']) }
}

export function mkVec3(p: Point3): Vec3 {
  return { '@_x': p.x, '@_y': p.y, '@_z': p.z }
}
