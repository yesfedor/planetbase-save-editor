const readline = require('readline-sync')
const {colonists, resources, bots} = require('../lib')
const {getSpawnLocation} = require('../utils/getSpawnLocation')

const {getNextId, setNextId} = require('../utils/gameGenerator')

function colonistAddItem(documentRoot) {
  const colonistIndex = readline.keyInSelect(
    colonists.types,
    'Select Colonist: '
  )

  if (colonistIndex === -1) {
    throw new Error('Cancelled')
  }

  const selectedType = colonists.types[colonistIndex]

  const spawnLocation = getSpawnLocation(documentRoot, 'entity')

  let nextId = getNextId(documentRoot)

  const gender = Math.floor(Math.random() * 2)
  const newColonist = {
    '@_type': 'Colonist',
    'status-flags': {'@_value': '0'},
    'wander-time': {'@_value': "17.92"},
    'basic-meal-count': {'@_value': '0'},
    'head-index': {'@_value': '3'},
    'skin-color-index': {'@_value': '2'},
    'hair-color-index': {'@_value': '8'},
    'inmunity-to-contagion-time': {'@_value': '0'},
    id: {'@_value': nextId++},
    position: spawnLocation.position,
    orientation: { ...spawnLocation.orientation, '@_x': '0', '@_z': 0 },
    location: {'@_value': '1'},
    name: {'@_value': `${selectedType} ${nextId}`},
    specialization: {'@_value': colonists.type[selectedType].specialization},
    state: {'@_value': '0'},
    Health: {'@_value': '1'},
    Nutrition: {'@_value': '1'},
    Hydration: {'@_value': '1'},
    Oxygen: {'@_value': '1'},
    Sleep: {'@_value': '1'},
    Morale: {'@_value': '1'},
    gender: {'@_value': gender},
    doctor: {'@_value': 'False'},
  }

  setNextId(documentRoot, nextId)
  spawnLocation.onSaveEntity(newColonist)

  console.info(`\n\n=== Colonist successful added: ${selectedType} ===\n\n`)

  return documentRoot
}

function colonistMenu(documentRoot) {
  documentRoot = colonistAddItem(documentRoot)

  return documentRoot
}

module.exports = colonistMenu
