import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { MapObject } from '../api.js'

export interface Picked {
  kind: string
  id: string
  type: string
  world: { x: number; y: number; z: number }
}

const RESOURCE_COLORS: Record<string, number> = {
  Metal: 0x9fb3c8, Bioplastic: 0x6fd3c0, Meal: 0xe0a95a, AlcoholicDrink: 0xc86bd8,
  MedicalSupplies: 0xe0556b, Gun: 0x8a94a6, Starch: 0xd9d06a, MedicinalPlants: 0x7bd36f,
  Ore: 0xb07a4a, Spares: 0x5a8fd8, Semiconductors: 0x4ad0e0, Vegetables: 0x7bd36f, Vitromeat: 0xd98a8a,
}

function moduleColor(type: string): number {
  let h = 0
  for (let i = 0; i < type.length; i++) h = (h * 31 + type.charCodeAt(i)) >>> 0
  const hue = (h % 360) / 360
  return new THREE.Color().setHSL(hue, 0.45, 0.55).getHex()
}

export class WorldMap {
  private renderer!: THREE.WebGLRenderer
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private controls!: OrbitControls
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private center = new THREE.Vector3()
  private pickables: THREE.Object3D[] = []
  private dragging: THREE.Object3D | null = null
  private dragPlane = new THREE.Plane()
  private downPos = new THREE.Vector2()
  private moved = 0
  private ro?: ResizeObserver
  private raf = 0
  private selectedId: string | null = null
  private keys = new Set<string>()
  private clock = 0
  private canvas!: HTMLCanvasElement
  private activePointer: number | null = null

  onSelect?: (p: Picked | null) => void
  onMoved?: (p: Picked) => void

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const parent = canvas.parentElement!
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0b1016)
    this.scene.fog = new THREE.Fog(0x0b1016, 120, 400)

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000)
    this.camera.position.set(60, 70, 60)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.maxPolarAngle = Math.PI / 2.05

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.75))
    const dir = new THREE.DirectionalLight(0xffffff, 1.1)
    dir.position.set(50, 120, 30)
    this.scene.add(dir)

    const grid = new THREE.GridHelper(400, 80, 0x24344a, 0x1a2735)
    ;(grid.material as THREE.Material).transparent = true
    ;(grid.material as THREE.Material).opacity = 0.5
    this.scene.add(grid)

    canvas.addEventListener('pointerdown', this.onDown, true)
    window.addEventListener('pointermove', this.onMove)
    window.addEventListener('pointerup', this.onUp)
    canvas.tabIndex = 0
    canvas.addEventListener('keydown', this.onKey)
    canvas.addEventListener('keyup', this.onKey)
    canvas.addEventListener('pointerenter', () => canvas.focus())

    this.ro = new ResizeObserver(() => this.resize(parent))
    this.ro.observe(parent)
    this.resize(parent)
    this.loop()
  }

  private resize(parent: HTMLElement) {
    const w = parent.clientWidth || 1
    const h = parent.clientHeight || 1
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  private onKey = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase()
    if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
      if (e.type === 'keydown') this.keys.add(k)
      else this.keys.delete(k)
      e.preventDefault()
    }
  }

  private moveByKeys(dt: number) {
    if (!this.keys.size) return
    const speed = 40 * dt
    const forward = new THREE.Vector3()
    this.camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    const move = new THREE.Vector3()
    if (this.keys.has('w') || this.keys.has('arrowup')) move.add(forward)
    if (this.keys.has('s') || this.keys.has('arrowdown')) move.sub(forward)
    if (this.keys.has('d') || this.keys.has('arrowright')) move.add(right)
    if (this.keys.has('a') || this.keys.has('arrowleft')) move.sub(right)
    if (this.keys.has('e')) move.y += 1
    if (this.keys.has('q')) move.y -= 1
    if (move.lengthSq() === 0) return
    move.normalize().multiplyScalar(speed)
    this.camera.position.add(move)
    this.controls.target.add(move)
  }

  private loop = () => {
    const now = performance.now()
    const dt = this.clock ? Math.min((now - this.clock) / 1000, 0.1) : 0
    this.clock = now
    this.moveByKeys(dt)
    this.controls.update()
    // keep a grabbed object under the cursor even while flying (camera moving, mouse still)
    if (this.dragging) this.updateDragPosition()
    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.loop)
  }

  setData(objects: MapObject[]) {
    this.clearGroups()

    const cx = objects.reduce((a, o) => a + o.position.x, 0) / (objects.length || 1)
    const cz = objects.reduce((a, o) => a + o.position.z, 0) / (objects.length || 1)
    this.center.set(cx, 0, cz)

    const modules = objects.filter((o) => o.kind === 'module')
    const connections = objects.filter((o) => o.kind === 'connection')
    const resources = objects.filter((o) => o.kind === 'resource')
    const chars = objects.filter((o) => o.kind === 'colonist' || o.kind === 'bot')
    const cam = objects.find((o) => o.kind === 'camera')

    for (const c of connections) this.addSimple(c, new THREE.BoxGeometry(1.4, 0.4, 1.4), 0x33475f, false)
    for (const m of modules) this.addSimple(m, new THREE.CylinderGeometry(2.6, 2.6, 2.2, 12), moduleColor(m.type), false)
    for (const c of chars) {
      const geo = c.kind === 'bot' ? new THREE.BoxGeometry(1, 1.6, 1) : new THREE.ConeGeometry(0.7, 1.8, 8)
      this.addSimple(c, geo, c.kind === 'bot' ? 0xf5a05a : 0x38d6c8, true)
    }
    if (cam) this.addSimple(cam, new THREE.OctahedronGeometry(1.6), 0xb06bd8, true)

    this.addResources(resources)
    this.frameScene()
  }

  private groups: THREE.Object3D[] = []
  private clearGroups() {
    for (const g of this.groups) {
      this.scene.remove(g)
      g.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
      })
    }
    this.groups = []
    this.pickables = []
  }

  private addSimple(o: MapObject, geo: THREE.BufferGeometry, color: number, pickable: boolean) {
    const mat = new THREE.MeshLambertMaterial({ color })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(o.position.x - this.center.x, o.position.y + 0.4, o.position.z - this.center.z)
    mesh.userData = { kind: o.kind, id: o.id, type: o.type, baseColor: color }
    this.scene.add(mesh)
    this.groups.push(mesh)
    if (pickable) this.pickables.push(mesh)
  }

  private addResources(resources: MapObject[]) {
    if (!resources.length) return
    const geo = new THREE.BoxGeometry(0.6, 0.6, 0.6)
    const mat = new THREE.MeshLambertMaterial({ vertexColors: false })
    const mesh = new THREE.InstancedMesh(geo, mat, resources.length)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    resources.forEach((r, i) => {
      dummy.position.set(r.position.x - this.center.x, r.position.y + 0.3, r.position.z - this.center.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, color.setHex(RESOURCE_COLORS[r.type] ?? 0x8899aa))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    this.scene.add(mesh)
    this.groups.push(mesh)
  }

  private frameScene() {
    const box = new THREE.Box3()
    for (const g of this.groups) box.expandByObject(g)
    if (box.isEmpty()) return
    const size = box.getSize(new THREE.Vector3()).length()
    const c = box.getCenter(new THREE.Vector3())
    this.controls.target.copy(c)
    this.camera.position.set(c.x + size * 0.5, size * 0.5, c.z + size * 0.5)
  }

  private updatePointer(e: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
  }

  private onDown = (e: PointerEvent) => {
    this.updatePointer(e)
    this.downPos.set(e.clientX, e.clientY)
    this.moved = 0
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hit = this.raycaster.intersectObjects(this.pickables, false)[0]
    if (hit) {
      // capture phase + stopPropagation so OrbitControls never starts a rotate on this drag
      e.stopPropagation()
      e.preventDefault()
      this.dragging = hit.object
      this.activePointer = e.pointerId
      this.canvas.setPointerCapture?.(e.pointerId)
      this.controls.enabled = false
      this.dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), hit.object.position)
    }
  }

  private onMove = (e: PointerEvent) => {
    if (!this.dragging) return
    this.moved += Math.abs(e.clientX - this.downPos.x) + Math.abs(e.clientY - this.downPos.y)
    this.updatePointer(e)
    this.updateDragPosition()
  }

  private updateDragPosition() {
    if (!this.dragging) return
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const p = new THREE.Vector3()
    if (this.raycaster.ray.intersectPlane(this.dragPlane, p)) {
      this.dragging.position.set(p.x, this.dragging.position.y, p.z)
    }
  }

  private onUp = () => {
    if (!this.dragging) return
    const obj = this.dragging
    this.dragging = null
    if (this.activePointer !== null) {
      this.canvas.releasePointerCapture?.(this.activePointer)
      this.activePointer = null
    }
    this.controls.enabled = true
    const picked = this.toPicked(obj)
    if (this.moved < 6) this.select(obj)
    else if (this.onMoved) this.onMoved(picked)
  }

  private toPicked(obj: THREE.Object3D): Picked {
    return {
      kind: obj.userData.kind,
      id: obj.userData.id,
      type: obj.userData.type,
      world: {
        x: obj.position.x + this.center.x,
        y: obj.position.y - 0.4,
        z: obj.position.z + this.center.z,
      },
    }
  }

  private select(obj: THREE.Object3D) {
    this.highlight(obj.userData.id)
    if (this.onSelect) this.onSelect(this.toPicked(obj))
  }

  highlight(id: string | null) {
    this.selectedId = id
    for (const o of this.pickables) {
      const m = o as THREE.Mesh
      const mat = m.material as THREE.MeshLambertMaterial
      mat.emissive?.setHex(o.userData.id === id ? 0x556677 : 0x000000)
    }
  }

  applyMoved(id: string, world: { x: number; y: number; z: number }) {
    const obj = this.pickables.find((o) => o.userData.id === id)
    if (obj) obj.position.set(world.x - this.center.x, world.y + 0.4, world.z - this.center.z)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro?.disconnect()
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerup', this.onUp)
    this.keys.clear()
    this.clearGroups()
    this.controls.dispose()
    this.renderer.dispose()
  }
}
