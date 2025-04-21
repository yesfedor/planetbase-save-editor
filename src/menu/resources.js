const readline = require('readline-sync')
const { resources} = require('../lib')

function getColonyShip(documentRoot) {
  const colonyShip = documentRoot['save-game'].ships.ship

  if (!colonyShip) throw new Error('ColonyShip not found!')

  return colonyShip
}

function resourcesItem(documentRoot, ) {

}

function resourcesMenu(documentRoot) {
  getColonyShip(documentRoot)

  const resourceIndex = readline.keyInSelect(
    resources.types,
    'Select resource:'
  );

  if (resourceIndex === -1) {
    throw new Error('Cancelled')
  }

  const selectedType = resources.types[resourceIndex]


  return documentRoot
}

module.exports = resourcesMenu
