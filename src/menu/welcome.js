const path = require('path')
const getSaveFiles = require('../utils/getSaveFiles')
const readline = require('readline-sync')

const savesPath = path.join(__dirname, '..', '..', 'saves')

function showFileItem(files) {
  console.info('\n=== Select your save file ===')
  files.forEach((file, index) => {
    console.info(`${index + 1} - ${file.name}`)
  })
  console.info('0 - Exit')
}

function menu() {
  let selectedFile = null

  const saveFiles = getSaveFiles(savesPath)

  showFileItem(saveFiles)

  const choice = readline.question('Select: ')
  const choiceNum = parseInt(choice)

  if (choiceNum === 0) {
    console.info('Exited')
    process.exit(0)
  }

  if (choiceNum > 0 && choiceNum <= saveFiles.length) {
    selectedFile = saveFiles[choiceNum - 1]
    console.info(`\nChosen file: ${selectedFile.name}`)
    return selectedFile
  } else {
    console.info('Error')
  }
}

module.exports = menu
