const readline = require('readline-sync')
const {bots, resources} = require('../lib')
const {getSpawnLocation} = require('../utils/getSpawnLocation')

const {getNextId, setNextId} = require('../utils/gameGenerator')

function botAddItem(documentRoot) {
  const botIndex = readline.keyInSelect(
    bots.types,
    'Select Bot: '
  )

  if (botIndex === -1) {
    throw new Error('Cancelled')
  }

  const selectedType = bots.types[botIndex]

  const spawnLocation = getSpawnLocation(documentRoot, 'entity')

  let nextId = getNextId(documentRoot)

  const newBot = {
    '@_type': 'Bot',
    'status-flags': {'@_value': '0'},
    'wander-time': {'@_value': "17.92"},
    'integrity-decay-rate': {'@_value': '50000'},
    id: {'@_value': nextId++},
    position: spawnLocation.position,
    orientation: spawnLocation.orientation,
    location: {'@_value': '1'},
    name: {'@_value': `${bots.type[selectedType].namePrefix}${nextId}`},
    specialization: {'@_value': bots.type[selectedType].specialization},
    state: {'@_value': '0'},
    Condition: {'@_value': '1'},
    Integrity: {'@_value': '1'},
  }

  setNextId(documentRoot, nextId)
  spawnLocation.onSaveEntity(newBot)

  console.info(`\n\n=== Bot successful added: ${selectedType} ===\n\n`)

  return documentRoot
}

function botMenu(documentRoot) {
  documentRoot = botAddItem(documentRoot)

  return documentRoot
}

module.exports = botMenu
