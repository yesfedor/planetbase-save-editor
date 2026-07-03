import fs from 'node:fs'
import path from 'node:path'
import { SaveDocument } from './SaveDocument.js'
import type { SaveStrategy } from '../types/domain.js'

export interface SaveFile {
  name: string
  path: string
}

export function listSaves(dir: string): SaveFile[] {
  const out: SaveFile[] = []
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d)) {
      const full = path.join(d, entry)
      if (fs.statSync(full).isDirectory()) walk(full)
      else if (entry.endsWith('.sav')) out.push({ name: entry, path: full })
    }
  }
  walk(dir)
  return out
}

export function load(filePath: string): SaveDocument {
  const xml = fs.readFileSync(filePath, 'utf-8')
  return SaveDocument.fromXml(xml)
}

function modifiedPath(sourcePath: string): string {
  const dir = path.dirname(sourcePath)
  const base = path.basename(sourcePath, '.sav')
  return path.join(dir, `${base}_modified.sav`)
}

export interface SaveResult {
  path: string
  backupPath?: string
}

export function save(doc: SaveDocument, sourcePath: string, strategy: SaveStrategy): SaveResult {
  const xml = doc.toXml()

  if (strategy === 'new-file') {
    const target = modifiedPath(sourcePath)
    fs.writeFileSync(target, xml)
    return { path: target }
  }

  const backupPath = `${sourcePath}.bak`
  if (fs.existsSync(sourcePath) && !fs.existsSync(backupPath)) {
    fs.copyFileSync(sourcePath, backupPath)
  }
  fs.writeFileSync(sourcePath, xml)
  return { path: sourcePath, backupPath }
}
