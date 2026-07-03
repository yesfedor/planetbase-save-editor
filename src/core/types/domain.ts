export const RESOURCE_TYPES = [
  'Metal',
  'Bioplastic',
  'Meal',
  'AlcoholicDrink',
  'MedicalSupplies',
  'Gun',
  'Starch',
  'MedicinalPlants',
  'Ore',
  'Spares',
  'Semiconductors',
  'Vegetables',
  'Vitromeat',
] as const

export type ResourceType = (typeof RESOURCE_TYPES)[number]

export const COLONIST_SPECS = ['Worker', 'Biologist', 'Engineer', 'Medic', 'Guard'] as const
export type ColonistSpec = (typeof COLONIST_SPECS)[number]

export const BOT_SPECS = ['Constructor', 'Carrier', 'Driller'] as const
export type BotSpec = (typeof BOT_SPECS)[number]

export type SpawnSource = 'colonyShip' | 'camera' | 'coords' | 'storage'

export type SaveStrategy = 'new-file' | 'overwrite'

export type ResourceContainer = 'ground' | 'ship' | 'storage'

export interface Point3 {
  x: number
  y: number
  z: number
}

export interface MapObject {
  kind: 'module' | 'connection' | 'colonist' | 'bot' | 'resource' | 'camera'
  id: string
  type: string
  position: Point3
  orientation: Point3
}

export interface MapSnapshot {
  objects: MapObject[]
  counts: Record<string, number>
}
