const readline = require('readline-sync')
const { resources} = require('../lib')
const { getSpawnLocation } = require('../utils/getSpawnLocation')

const { getNextId, setNextId } = require('../utils/gameGenerator')

function resourcesAddItem(documentRoot) {
  const resourceIndex = readline.keyInSelect(
    resources.types,
    'Select resource: '
  )

  if (resourceIndex === -1) {
    throw new Error('Cancelled')
  }

  const selectedType = resources.types[resourceIndex]

  const spawnLocation = getSpawnLocation(documentRoot, 'resource')

  const count = parseInt(readline.question(`How many ${selectedType} should add? `))
  if (isNaN(count)) {
    throw new Error('Incorrect number')
  }

  let nextId = getNextId(documentRoot)

  const newResources = Array.from({length: count}, () => ({
    '@_type': selectedType,
    'trader-id': {'@_value': '-1'},
    id: {'@_value': nextId++},
    position: spawnLocation.position,
    orientation: spawnLocation.orientation,
    state: {'@_value': '0'},
    location: {'@_value': '1'},
    subtype: {'@_value': '0'},
    condition: {'@_value': '1'},
    durability: {'@_value': '1'},
  }))

  setNextId(documentRoot, nextId)
  spawnLocation.onSaveResources(newResources)

  console.info(`\n\n=== Resource successful added: ${count} ${selectedType} pieces ===\n\n`)

  return documentRoot
}

function resourcesMenu(documentRoot) {
  documentRoot = resourcesAddItem(documentRoot)

  return documentRoot
}

module.exports = resourcesMenu
