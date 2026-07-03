import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export type SaveMode = 'project' | 'game' | 'custom'

export interface Settings {
  mode: SaveMode
  customDir: string
}

const ROOT = process.cwd()
const SETTINGS_PATH = path.join(ROOT, 'settings.json')
const PROJECT_DIR = path.join(ROOT, 'saves')

export function detectGameDir(): string {
  const home = os.homedir()
  const p = (...parts: string[]) => path.join(home, ...parts, 'Planetbase', 'Saves')

  let candidates: string[]
  switch (process.platform) {
    case 'win32':
      candidates = [
        p('Documents'),
        p('OneDrive', 'Documents'),
        p('OneDrive', 'Документы'),
        p('Документы'),
      ]
      break
    case 'darwin':
      candidates = [p('Library', 'Application Support')]
      break
    default:
      candidates = [p('.local', 'share')]
      break
  }

  return candidates.find((c) => fs.existsSync(c)) ?? candidates[0]
}

function defaultSettings(): Settings {
  const gameDir = detectGameDir()
  return { mode: fs.existsSync(gameDir) ? 'game' : 'project', customDir: '' }
}

export function loadSettings(): Settings {
  if (!fs.existsSync(SETTINGS_PATH)) return defaultSettings()
  try {
    const raw = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'))
    if (raw.mode === 'project' || raw.mode === 'game' || raw.mode === 'custom') {
      return { mode: raw.mode, customDir: typeof raw.customDir === 'string' ? raw.customDir : '' }
    }
    if (typeof raw.gameSavesDir === 'string' && raw.gameSavesDir.trim()) {
      return { mode: 'custom', customDir: raw.gameSavesDir.trim() }
    }
    return defaultSettings()
  } catch {
    return defaultSettings()
  }
}

export function saveSettings(next: Settings): Settings {
  const clean: Settings = {
    mode: next.mode === 'game' || next.mode === 'custom' ? next.mode : 'project',
    customDir: typeof next.customDir === 'string' ? next.customDir.trim() : '',
  }
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(clean, null, 2))
  return clean
}

export interface ResolvedDirs {
  dir: string
  mode: SaveMode
  exists: boolean
  projectDir: string
  gameDir: string
  gameExists: boolean
  customDir: string
}

export function resolveSavesDir(): ResolvedDirs {
  const settings = loadSettings()
  const gameDir = detectGameDir()

  let dir = PROJECT_DIR
  if (settings.mode === 'game') dir = gameDir
  else if (settings.mode === 'custom') dir = settings.customDir || PROJECT_DIR

  return {
    dir,
    mode: settings.mode,
    exists: fs.existsSync(dir),
    projectDir: PROJECT_DIR,
    gameDir,
    gameExists: fs.existsSync(gameDir),
    customDir: settings.customDir,
  }
}
