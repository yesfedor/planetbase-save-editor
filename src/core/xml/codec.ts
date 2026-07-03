import { XMLParser, XMLBuilder } from 'fast-xml-parser'

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  suppressEmptyNode: false,
  alwaysCreateTextNode: true,
}

const parser = new XMLParser(options)
const builder = new XMLBuilder(options)

export function parseXml(xml: string): Record<string, any> {
  return parser.parse(xml)
}

export function buildXml(root: Record<string, any>): string {
  return builder.build(root)
}
