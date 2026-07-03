const readline = require('readline-sync')
const { resources} = require('../lib')
const { getSpawnLocation } = require('../utils/getSpawnLocation')

const { getNextId, setNextId } = require('../utils/gameGenerator')
const operationMenuFn = require("./operation");

function selectResourceMenu() {
  const resourceIndex = readline.keyInSelect(
    resources.types,
    'Select resource: '
  )

  if (resourceIndex === -1) {
    throw new Error('Cancelled')
  }

  return resources.types[resourceIndex]
}

function resourcesAddItem(documentRoot) {
  const selectedType = selectResourceMenu()

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

function resourcesRemoveAllByType(documentRoot) {
  const selectedType = selectResourceMenu()

  const count = documentRoot['save-game'].resources.resource
    .filter(
      (item) => item['@_type'] === selectedType
    )
    ?.length || 0

  if (count) {
    documentRoot['save-game'].resources.resource = documentRoot['save-game'].resources.resource.filter(
      (item) => item['@_type'] !== selectedType
    )

  }

  console.info(`\n\n=== Resource successful removed: ${count || 0} ${selectedType} pieces ===\n\n`)

  return documentRoot
}

const operations = [
  {
    code: 'add',
    name: 'Resource Add',
  },
  {
    code: 'resources_remove_all_by_type_',
    name: 'Resource Remove All By Type',
  },
]
function resourcesMenu(documentRoot) {
  switch (operationMenuFn(operations)) {
    case 'add':
      documentRoot = resourcesAddItem(documentRoot)
      break
    case 'resources_remove_all_by_type_':
      documentRoot = resourcesRemoveAllByType(documentRoot)
      break
    default:
      break
  }

  return documentRoot
}

module.exports = resourcesMenu
