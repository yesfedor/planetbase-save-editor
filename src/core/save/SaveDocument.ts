import { parseXml, buildXml } from '../xml/codec.js'
import { asArray, num, mkVal } from '../xml/nodes.js'
import type { SaveRoot, SaveGame, CharacterNode, ResourceNode, ConstructionNode } from '../types/save.js'

export class SaveDocument {
  readonly root: SaveRoot

  private constructor(root: SaveRoot) {
    this.root = root
    this.normalize()
  }

  static fromXml(xml: string): SaveDocument {
    const root = parseXml(xml) as SaveRoot
    if (!root['save-game']) throw new Error('Not a PlanetBase save: <save-game> not found')
    return new SaveDocument(root)
  }

  toXml(): string {
    return buildXml(this.root as unknown as Record<string, any>)
  }

  get sg(): SaveGame {
    return this.root['save-game']
  }

  private normalize(): void {
    const sg = this.sg
    if (sg.characters && sg.characters.character) {
      sg.characters.character = asArray(sg.characters.character)
    }
    if (sg.resources && sg.resources.resource) {
      sg.resources.resource = asArray(sg.resources.resource)
    }
    const cons = sg.constructions as { construction?: unknown } | undefined
    if (cons && cons.construction) {
      cons.construction = asArray(cons.construction)
    }
    const ship = sg.ships?.ship
    if (ship?.['resource-container']?.resource) {
      ship['resource-container'].resource = asArray(ship['resource-container'].resource)
    }
  }

  characters(): CharacterNode[] {
    const sg = this.sg
    if (!sg.characters) sg.characters = {}
    if (!Array.isArray(sg.characters.character)) sg.characters.character = asArray(sg.characters.character)
    return sg.characters.character as CharacterNode[]
  }

  setCharacters(list: CharacterNode[]): void {
    if (!this.sg.characters) this.sg.characters = {}
    this.sg.characters.character = list
  }

  groundResources(): ResourceNode[] {
    const sg = this.sg
    if (!sg.resources) sg.resources = {}
    if (!Array.isArray(sg.resources.resource)) sg.resources.resource = asArray(sg.resources.resource)
    return sg.resources.resource as ResourceNode[]
  }

  setGroundResources(list: ResourceNode[]): void {
    if (!this.sg.resources) this.sg.resources = {}
    this.sg.resources.resource = list
  }

  constructions(): ConstructionNode[] {
    const cons = this.sg.constructions as { construction?: ConstructionNode | ConstructionNode[] } | undefined
    if (!cons || !cons.construction) return []
    return asArray(cons.construction)
  }

  nextId(): number {
    return num(this.sg['id-generator']['next-id'])
  }

  allocId(count = 1): number {
    const start = this.nextId()
    this.sg['id-generator']['next-id'] = mkVal(start + count)
    return start
  }
}
