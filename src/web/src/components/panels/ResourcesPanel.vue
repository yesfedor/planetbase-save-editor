<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../../api.js'
import { store } from '../../store.js'
import TargetPicker from '../TargetPicker.vue'

const p = computed(() => store.projection!)
const count = ref(500)
const target = ref<Record<string, unknown>>({ kind: 'camera' })
const busy = ref('')

async function add(type: string) {
  busy.value = type
  const res = await store.run(() => api.addResources(type, count.value, target.value))
  busy.value = ''
  if (res) {
    store.setProjection(res.projection)
    store.markDirty()
    const { placed, dropped } = res.result
    store.toast(dropped > 0 ? `Added ${placed} ${type} · ${dropped} didn't fit` : `Added ${placed} ${type}`, dropped > 0 ? 'err' : 'ok')
  }
}

async function removeSome(type: string) {
  busy.value = type
  const res = await store.run(() => api.removeResources(type, 'all', count.value))
  busy.value = ''
  if (res) {
    store.setProjection(res.projection)
    store.markDirty()
    store.toast(`Removed ${res.removed} ${type}`, 'ok')
  }
}

async function removeType(type: string) {
  const res = await store.run(() => api.removeResources(type, 'all'), `Removed all ${type}`)
  if (res) {
    store.setProjection(res.projection)
    store.markDirty()
  }
}
</script>

<template>
  <div class="wrap-panel">
    <div class="card toolbar">
      <div class="trow">
        <div class="field">
          <div class="label">Amount to add</div>
          <div class="row">
            <input type="number" min="1" v-model.number="count" style="width: 110px" />
            <button class="ghost" @click="count = 100">100</button>
            <button class="ghost" @click="count = 500">500</button>
            <button class="ghost" @click="count = 1000">1000</button>
          </div>
        </div>
        <div class="field grow">
          <div class="label">Where</div>
          <TargetPicker mode="resource" @update="target = $event" />
        </div>
      </div>
    </div>

    <div class="cards">
      <div v-for="type in p.meta.resourceTypes" :key="type" class="rcard card" :class="{ empty: !p.counts[type] }">
        <div class="rc-head">
          <span class="rc-name">{{ type }}</span>
          <span class="rc-count">{{ (p.counts[type] || 0).toLocaleString() }}</span>
        </div>
        <div class="rc-actions">
          <button class="primary" :disabled="busy === type" @click="add(type)">+ {{ count }}</button>
          <button class="minus" :disabled="busy === type || !p.counts[type]" @click="removeSome(type)">− {{ count }}</button>
        </div>
        <button class="danger clear" :disabled="!p.counts[type]" @click="removeType(type)">Clear all</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap-panel {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.toolbar {
  padding: 16px 18px;
  position: sticky;
  top: -20px;
  z-index: 5;
}
.trow {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.label {
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.rcard {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rcard.empty {
  opacity: 0.72;
}
.rc-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.rc-name {
  font-weight: 600;
}
.rc-count {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.rc-actions {
  display: flex;
  gap: 8px;
}
.rc-actions button {
  flex: 1;
  padding: 7px;
}
.minus {
  border-color: #5a422a;
  color: #f5c08a;
}
.minus:hover:not(:disabled) {
  border-color: var(--accent-2);
}
.clear {
  width: 100%;
  padding: 5px;
  font-size: 12px;
}
</style>
