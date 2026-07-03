<script setup lang="ts">
import { computed } from 'vue'
import { store } from '../../store.js'

defineEmits<{ (e: 'go', tab: string): void }>()
const p = computed(() => store.projection!)

const totalResources = computed(() => Object.values(p.value.counts).reduce((a, b) => a + b, 0))
const colonists = computed(() => p.value.characters.filter((c) => c.kind === 'Colonist').length)
const bots = computed(() => p.value.characters.filter((c) => c.kind === 'Bot').length)
const freeSlots = computed(() => p.value.storages.reduce((a, s) => a + s.freeSlots, 0))
const topResources = computed(() =>
  Object.entries(p.value.counts).sort((a, b) => b[1] - a[1]),
)
</script>

<template>
  <div class="grid">
    <div class="stats">
      <div class="stat card" @click="$emit('go', 'resources')">
        <div class="n">{{ totalResources.toLocaleString() }}</div>
        <div class="l muted">Resources</div>
      </div>
      <div class="stat card" @click="$emit('go', 'colonists')">
        <div class="n">{{ colonists }}</div>
        <div class="l muted">Colonists</div>
      </div>
      <div class="stat card" @click="$emit('go', 'bots')">
        <div class="n">{{ bots }}</div>
        <div class="l muted">Bots</div>
      </div>
      <div class="stat card">
        <div class="n">{{ p.storages.length }}</div>
        <div class="l muted">Storages · {{ freeSlots }} free</div>
      </div>
    </div>

    <div class="card block">
      <h3>Resources by type</h3>
      <div v-if="!topResources.length" class="muted">None.</div>
      <div v-for="[type, n] in topResources" :key="type" class="bar-row">
        <span class="bar-label">{{ type }}</span>
        <div class="bar-track">
          <div class="bar-fill" :style="{ width: (n / topResources[0][1]) * 100 + '%' }"></div>
        </div>
        <span class="bar-n">{{ n.toLocaleString() }}</span>
      </div>
    </div>

    <div class="card block">
      <h3>Colony</h3>
      <div class="kv"><span class="muted">Name</span><b>{{ p.colony.name || '—' }}</b></div>
      <div class="kv"><span class="muted">Save version</span><b>{{ p.version }}</b></div>
      <div class="kv"><span class="muted">Colony Ship</span><b>{{ p.hasShip ? 'present' : 'none' }}</b></div>
      <button class="primary" style="margin-top: 10px" @click="$emit('go', 'map')">Open 3D map →</button>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;
}
.stats {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stat {
  padding: 18px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.stat:hover {
  border-color: var(--accent);
}
.stat .n {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
}
.stat .l {
  font-size: 13px;
  margin-top: 2px;
}
.block {
  padding: 18px;
}
h3 {
  margin: 0 0 14px;
  font-size: 14px;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.bar-label {
  width: 120px;
  font-size: 13px;
}
.bar-track {
  flex: 1;
  height: 8px;
  background: var(--bg-2);
  border-radius: 999px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: 999px;
}
.bar-n {
  width: 66px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}
.kv {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid var(--border);
}
</style>
