const fs = require('fs');
const path = require('path');

function getSaveFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    const filePath = path.join(dirPath, file)
    if (fs.statSync(filePath).isDirectory()) {
      getSaveFiles(filePath, arrayOfFiles)
    } else {
      arrayOfFiles.push({
        name: file,
        path: filePath
      })
    }
  })

  return arrayOfFiles.filter((file) => file.name.endsWith('.sav'))
}

module.exports = getSaveFiles
