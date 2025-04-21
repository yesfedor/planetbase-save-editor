const fs = require('fs')
const path = require('path')

const {XMLParser, XMLBuilder} = require('fast-xml-parser')

const welcomeMenuFn = require('./menu/welcome')
const operationMenuFn = require('./menu/operation')
const resourcesMenuFn = require('./menu/resources')

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  suppressEmptyNode: false,
  alwaysCreateTextNode: true,
}

const parser = new XMLParser(options)
const builder = new XMLBuilder(options)

function wrapper(fn) {
  try {
    fn()
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

const operations = [
  {
    code: 'resources',
    name: 'Resource Management',
  },
  {
    code: 'save_and_continue',
    name: 'Save & More',
  },
  {
    code: 'save_and_exit',
    name: 'Save & Exit',
  },
]

module.exports = {
  selectedFile: {
    name: '',
    path: '',
  },

  documentRoot: null,

  _getDocumentRoot() {
    const xmlData = fs.readFileSync(this.selectedFile.path, 'utf-8')
    this.documentRoot = parser.parse(xmlData)
  },

  _saveDocumentRoot() {
    const xml = builder.build(this.documentRoot)

    const date = new Date()

    const filename = `_modified_${date.getMonth()}_${date.getFullYear()}.sav`
    const filePath = path.join(
      path.dirname(this.selectedFile.path),
      path.basename(this.selectedFile.path, '.sav') + filename
    )

    fs.writeFileSync(filePath, xml)
    console.info(`File saved: ${filePath}`)
  },

  start(skipRead = false) {
    wrapper(() => {
      console.info('PlanetBase Save Editor: Main Menu')
      if (!this.selectedFile.path) {
        this.selectedFile = welcomeMenuFn()
      }

      if (!skipRead) {
        this._getDocumentRoot()
      }

      switch (operationMenuFn(operations)) {
        case 'resources':
          this.documentRoot = resourcesMenuFn(this.documentRoot)
          this.start(true)
          break
        case 'save_and_continue':
          this._saveDocumentRoot()
          this.start(true)
          break
        case 'save_and_exit':
          this._saveDocumentRoot()
          process.exit(0)
          break
        default:
          console.info('Exited')
          break
      }
    })
  },
}
