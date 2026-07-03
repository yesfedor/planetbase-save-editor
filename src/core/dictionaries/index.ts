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
