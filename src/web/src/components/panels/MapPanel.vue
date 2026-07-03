<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { api } from '../../api.js'
import { store } from '../../store.js'
import { WorldMap, type Picked } from '../../three/WorldMap.js'

const canvas = ref<HTMLCanvasElement | null>(null)
const world = shallowRef<WorldMap | null>(null)
const selected = ref<Picked | null>(null)
const counts = ref<Record<string, number>>({})
const loading = ref(true)

const legend = [
  { c: '#38d6c8', l: 'Colonist' },
  { c: '#f5a05a', l: 'Bot' },
  { c: '#b06bd8', l: 'Camera' },
  { c: '#7f93aa', l: 'Module' },
  { c: '#33475f', l: 'Connection' },
]

async function load() {
  const data = await store.run(() => api.map())
  loading.value = false
  if (!data) return
  counts.value = data.counts
  world.value?.setData(data.objects)
}

async function persistMove(p: Picked) {
  if (p.kind === 'camera') {
    await store.run(() => api.moveCamera(p.world.x, p.world.y, p.world.z), 'Camera moved')
    store.markDirty()
  } else {
    const res = await store.run(() => api.updateCharacter({ id: p.id, pos: p.world }), `${p.type} moved`)
    if (res) {
      store.setProjection(res.projection)
      store.markDirty()
    }
  }
  if (selected.value?.id === p.id) selected.value = { ...p }
}

async function deleteSelected() {
  const s = selected.value
  if (!s || s.kind === 'camera') return
  const res = await store.run(() => api.removeCharacter(s.id), `Deleted ${s.type}`)
  if (res) {
    store.setProjection(res.projection)
    store.markDirty()
    selected.value = null
    world.value?.highlight(null)
    load()
  }
}

onMounted(() => {
  const w = new WorldMap()
  world.value = w
  w.onSelect = (p) => (selected.value = p)
  w.onMoved = (p) => persistMove(p)
  w.init(canvas.value!)
  load()
})

onBeforeUnmount(() => world.value?.dispose())
</script>

<template>
  <div class="map-root">
    <canvas ref="canvas"></canvas>

    <div class="legend card">
      <div class="lg-title">Legend</div>
      <div v-for="l in legend" :key="l.l" class="lg-row">
        <span class="dot" :style="{ background: l.c }"></span>{{ l.l }}
      </div>
      <div class="lg-hint muted">WASD / arrows to fly · Q/E up-down · drag colonists, bots or the camera to move them.</div>
    </div>

    <div class="hud card">
      <span class="badge">◎ {{ (counts.resource || 0).toLocaleString() }} resources</span>
      <span class="badge">☺ {{ counts.colonist || 0 }}</span>
      <span class="badge">⬡ {{ counts.bot || 0 }}</span>
      <span class="badge">▤ {{ counts.module || 0 }}</span>
    </div>

    <div v-if="loading" class="loading muted">Building world…</div>

    <div v-if="selected" class="inspector card">
      <div class="ins-head">
        <div>
          <div class="ins-type">{{ selected.type }}</div>
          <div class="muted">{{ selected.kind }} · #{{ selected.id }}</div>
        </div>
        <button class="ghost" @click="selected = null; world?.highlight(null)">✕</button>
      </div>
      <div class="ins-pos">
        <div class="coord"><span class="muted">X</span>{{ selected.world.x.toFixed(1) }}</div>
        <div class="coord"><span class="muted">Y</span>{{ selected.world.y.toFixed(1) }}</div>
        <div class="coord"><span class="muted">Z</span>{{ selected.world.z.toFixed(1) }}</div>
      </div>
      <button v-if="selected.kind !== 'camera'" class="danger" @click="deleteSelected">Delete</button>
    </div>
  </div>
</template>

<style scoped>
.map-root {
  position: relative;
  height: calc(100vh - 190px);
  min-height: 420px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.legend {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lg-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin-bottom: 2px;
}
.lg-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.dot {
  width: 11px;
  height: 11px;
  border-radius: 3px;
}
.lg-hint {
  font-size: 11px;
  max-width: 150px;
  margin-top: 4px;
}
.hud {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 8px 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  max-width: 220px;
  justify-content: flex-end;
  background: transparent;
  border: none;
  box-shadow: none;
}
.loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.inspector {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 240px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ins-head {
  display: flex;
  justify-content: space-between;
}
.ins-type {
  font-weight: 600;
  font-size: 15px;
}
.ins-pos {
  display: flex;
  gap: 8px;
}
.coord {
  flex: 1;
  background: var(--bg-2);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}
.coord .muted {
  font-size: 11px;
}
</style>
