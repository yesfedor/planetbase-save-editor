export interface Val {
  '@_value': string | number
}

export interface Vec3 {
  '@_x': string | number
  '@_y': string | number
  '@_z': string | number
}

export interface ResourceNode {
  '@_type': string
  id: Val
  'trader-id': Val
  position: Vec3
  orientation: Vec3
  state: Val
  location: Val
  subtype: Val
  condition: Val
  durability: Val
}

export interface CharacterNode {
  '@_type': 'Colonist' | 'Bot' | string
  id: Val
  name: Val
  specialization: Val | Val[]
  position: Vec3
  orientation: Vec3
  location: Val
  state: Val
  [key: string]: unknown
}

export interface StorageSlot {
  position: Vec3
  'max-height': Val
  resource?: ResourceNode | ResourceNode[]
}

export interface ConstructionNode {
  '@_type': 'Module' | 'Connection' | string
  id: Val
  position: Vec3
  orientation: Vec3
  'module-type'?: Val
  'size-index'?: Val
  'resource-storage'?: { slot: StorageSlot | StorageSlot[] }
  [key: string]: unknown
}

export interface ShipNode {
  id: Val
  position: Vec3
  orientation: Vec3
  state: Val
  'resource-container': {
    capacity: Val
    resource?: ResourceNode | ResourceNode[]
  }
  [key: string]: unknown
}

export interface SaveGame {
  '@_version'?: string | number
  'id-generator': {
    'next-id': Val
    'next-bot-id'?: Val
  }
  colony?: { name?: Val | Val[]; [key: string]: unknown }
  camera?: { position: Vec3; orientation: Vec3; [key: string]: unknown }
  characters?: { character?: CharacterNode | CharacterNode[] }
  constructions?: { construction?: ConstructionNode | ConstructionNode[] } | Record<string, unknown>
  resources?: {
    resource?: ResourceNode | ResourceNode[]
    'inmaterial-resources'?: unknown
  }
  ships?: { ship?: ShipNode }
  'ship-manager'?: { 'landing-permissions'?: Record<string, Val>; [key: string]: unknown }
  [key: string]: unknown
}

export interface SaveRoot {
  'save-game': SaveGame
}
