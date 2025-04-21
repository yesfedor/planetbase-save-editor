const readline = require("readline-sync");

function showOperationItem(items) {
  console.info('\n=== Select operation ===')
  items.forEach((item, index) => {
    console.info(`${index + 1} - ${item.name}`)
  })
  console.info('0 - Exit')
}

function menu(operations) {
  let selectedOperationCode = ''

  showOperationItem(operations)

  const choice = readline.question('Select: ')
  const choiceNum = parseInt(choice)

  if (choiceNum === 0) {
    console.info('Exited')
    process.exit(0)
  }

  if (choiceNum > 0 && choiceNum <= operations.length) {
    selectedOperationCode = operations[choiceNum - 1].code
    console.info(`\nChosen operation: ${operations[choiceNum - 1].name}`)
    return selectedOperationCode
  } else {
    console.info('Error')
  }
}

module.exports = menu
