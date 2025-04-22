const readline = require("readline-sync");
const {cloneDeep} = require("lodash");

const spawnLocation = {
  types: [],
  select: [],
  type: {
    colonyShip: {
      name: 'Colony Ship',
      description: 'if not on the map, choose another one',
    },
    cameraPosition: {
      name: 'Camera Position',
      description: 'the location of the camera at the time of saving',
    }
  },
}

spawnLocation.types = Object.keys(spawnLocation.type)

for (const locationType in spawnLocation.type) {
  const location = spawnLocation.type[locationType]
  spawnLocation.select.push(`${location.name} - ${location.description}`)
}

/**
 * @function getColonyShip
 * @param documentRoot { object }
 * */
function getColonyShip(documentRoot) {
  const colonyShip = documentRoot['save-game']?.ships?.ship

  if (!colonyShip) throw new Error('Colony Ship not found!')

  return colonyShip
}

function getCameraPosition(documentRoot) {
  const cameraPosition = documentRoot['save-game']['camera']

  if (!cameraPosition) throw new Error('Camera Position not found!')
  const cameraPositionClone = cloneDeep(cameraPosition)
  cameraPositionClone.position['@_y'] = '0'
  cameraPositionClone.orientation['@_y'] = '0'

  return cameraPositionClone
}

/**
 * @function getSpawnLocation
 * @param type { 'resource' | 'entity' } entity - colonist or bot
 * @param documentRoot { object }
 * */
function getSpawnLocation(documentRoot, type = 'resource') {
  const spawnLocationIndex = readline.keyInSelect(
    spawnLocation.types,
    'Select resource:'
  )

  if (spawnLocationIndex === -1) {
    throw new Error('Cancelled')
  }

  const selectedLocationType = spawnLocation.types[spawnLocationIndex]
  const selectedLocation = spawnLocation.type[selectedLocationType]

  let position = null
  let orientation = null

  function onSaveEntity(entity) {
    if (!documentRoot['save-game']['characters']) {
      documentRoot['save-game']['characters'] = {}
    }
    if (!documentRoot['save-game']['characters'].character) {
      documentRoot['save-game']['characters'].character = []
    }

    if (Array.isArray(entity)) {
      documentRoot['save-game']['characters'].character.push(...entity)
    } else {
      documentRoot['save-game']['characters'].character.push(entity)
    }
  }

  switch (selectedLocationType) {
    case 'colonyShip':
      const colonyShip = getColonyShip(documentRoot)
      position = colonyShip.position
      orientation = colonyShip.orientation

      if (type === 'entity') {
        position['@_x'] = Number(position['@_x']) + 0.05
        position['@_z'] = Number(position['@_z']) + 0.05
      }

      return {
        position,
        orientation,
        onSaveEntity,
        onSaveResources(newResources = []) {
          colonyShip['resource-container']['capacity']['@_value'] = Number(colonyShip['resource-container']['capacity']['@_value']) + newResources.length + 10
          colonyShip['resource-container'].resource.push(...newResources)
        },
      }
    case 'cameraPosition':
      const cameraPosition = getCameraPosition(documentRoot)
      position = cameraPosition.position
      orientation = cameraPosition.orientation

      return {
        position,
        orientation,
        onSaveEntity,
        onSaveResources(newResources = []) {
          if (!documentRoot['save-game']) {
            documentRoot['save-game'].resources = {}
          }
          if (!documentRoot['save-game'].resources?.resource) {
            documentRoot['save-game'].resources.resource = []
          }
          documentRoot['save-game'].resources.resource.push(...newResources)
        },
      }
    default:
      throw new Error('Spawn cancelled')
  }
}

module.exports = {
  getColonyShip,
  getSpawnLocation,
}
