import type { BotSpec } from '../types/domain.js'

export const BOT_NAME_PREFIX: Record<BotSpec, string> = {
  Constructor: 'CNT-',
  Carrier: 'CR-',
  Driller: 'DR-',
}

export const MODULE_TYPES = [
  'ModuleTypeOxygenGenerator',
  'ModuleTypeAirlock',
  'ModuleTypePowerCollector',
  'ModuleTypeWaterExtractor',
  'ModuleTypeSolarPanel',
  'ModuleTypeStorage',
  'ModuleTypeCanteen',
  'ModuleTypeDorm',
  'ModuleTypeBioDome',
  'ModuleTypeWindTurbine',
  'ModuleTypeMine',
  'ModuleTypeProcessingPlant',
  'ModuleTypeLab',
  'ModuleTypeMultiDome',
  'ModuleTypeSickBay',
  'ModuleTypeFactory',
  'ModuleTypeWaterTank',
  'ModuleTypeRoboticsFacility',
  'ModuleTypeBar',
  'ModuleTypeControlCenter',
] as const

export const STORAGE_MODULE_TYPE = 'ModuleTypeStorage'

export const RESOURCE_HEIGHT: Record<string, number> = {
  Metal: 0.9,
  Bioplastic: 0.9,
  Spares: 0.9,
  Ore: 0.9,
  Meal: 0.45,
  AlcoholicDrink: 0.45,
  MedicalSupplies: 0.45,
  Gun: 0.45,
  Starch: 0.45,
  MedicinalPlants: 0.45,
  Semiconductors: 0.45,
  Vegetables: 0.45,
  Vitromeat: 0.45,
}

export function resourceHeight(type: string): number {
  return RESOURCE_HEIGHT[type] ?? 0.45
}

export interface TechDef {
  id: string
  label: string
}

export const TECHS: TechDef[] = [
  { id: 'TechConstructorBot', label: 'Constructor Bot' },
  { id: 'TechDrillerBot', label: 'Driller Bot' },
  { id: 'TechGoliathTurbine', label: 'Goliath Turbine' },
  { id: 'TechColossalPanel', label: 'Colossal Solar Panel' },
  { id: 'TechMegaCollector', label: 'Mega Power Collector' },
  { id: 'TechSuperExtractor', label: 'Super Water Extractor' },
  { id: 'TechMassiveStorage', label: 'Massive Storage' },
  { id: 'TechFarmDome', label: 'Farm Dome' },
  { id: 'TechGmTomatoes', label: 'GM Tomatoes' },
  { id: 'TechGmOnions', label: 'GM Onions' },
]

export const TECH_IDS = TECHS.map((t) => t.id)
