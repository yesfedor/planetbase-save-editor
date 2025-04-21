function getNextId(documentRoot) {
  return parseInt(documentRoot['save-game']['id-generator']['next-id']['@_value'])
}

function setNextId(documentRoot, nextId) {
  documentRoot['save-game']['id-generator']['next-id']['@_value'] = nextId
}

module.exports = {
  getNextId,
  setNextId,
}
