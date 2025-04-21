const readline = require('readline-sync')
const { resources} = require('../lib')

function getColonyShip(documentRoot) {
  const colonyShip = documentRoot['save-game'].ships.ship

  if (!colonyShip) throw new Error('ColonyShip not found!')

  return colonyShip
}

function resourcesAddItem(documentRoot) {
  const resourceIndex = readline.keyInSelect(
    resources.types,
    'Select resource:'
  );

  if (resourceIndex === -1) {
    throw new Error('Cancelled')
  }

  const selectedType = resources.types[resourceIndex]

  const count = parseInt(readline.question('How many resources should add? '))
  if (isNaN(count)) {
    throw new Error('Incorrect number')
  }

  const colonyShip = getColonyShip(documentRoot)

  let nextId = parseInt(documentRoot['save-game']['id-generator']['next-id']['@_value'])

  nextId++;

  const newResources = Array.from({length: count}, () => ({
    '@_type': selectedType,
    'trader-id': {'@_value': '-1'},
    id: {'@_value': nextId++},
    position: colonyShip.position,
    orientation: colonyShip.orientation,
    state: colonyShip.state,
    location: {'@_value': '1'},
    subtype: {'@_value': '0'},
    condition: {'@_value': '1'},
    durability: {'@_value': '1'},
  }))

  colonyShip['resource-container'].resource.push(...newResources)
  documentRoot['save-game']['id-generator']['next-id']['@_value'] = nextId
  colonyShip['resource-container']['capacity']['@_value'] = Number(colonyShip['resource-container']['capacity']['@_value']) + count + 10

  console.info(`\n\n=== Resource successful added: ${count} ${selectedType} pieces ===\n\n`)

  return documentRoot
}

function resourcesMenu(documentRoot) {
  getColonyShip(documentRoot)

  documentRoot = resourcesAddItem(documentRoot)

  return documentRoot
}

module.exports = resourcesMenu
