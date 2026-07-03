<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { store } from '../store.js'

const props = defineProps<{ mode: 'resource' | 'entity' }>()
const emit = defineEmits<{ (e: 'update', target: Record<string, unknown>): void }>()

const p = computed(() => store.projection!)

const state = reactive({
  kind: 'camera' as 'ship' | 'camera' | 'coords' | 'storage' | 'airlock',
  x: 1000,
  y: 0,
  z: 1000,
  moduleId: '' as string,
  airlockId: '' as string,
})

const options = computed(() => {
  const opts: { value: typeof state.kind; label: string; hint?: string }[] = []
  if (p.value.hasShip) opts.push({ value: 'ship', label: 'Colony Ship' })
  opts.push({ value: 'camera', label: 'Under camera' })
  if (p.value.airlocks.length) opts.push({ value: 'airlock', label: 'Near airlock', hint: 'quick loading' })
  opts.push({ value: 'coords', label: 'Coordinates' })
  if (props.mode === 'resource' && p.value.storages.length)
    opts.push({ value: 'storage', label: 'Storage module' })
  return opts
})

watch(
  state,
  () => {
    const t: Record<string, unknown> = { kind: state.kind }
    if (state.kind === 'coords') Object.assign(t, { x: state.x, y: state.y, z: state.z })
    if (state.kind === 'storage') t.moduleId = state.moduleId
    if (state.kind === 'airlock') t.moduleId = state.airlockId
    emit('update', t)
  },
  { immediate: true, deep: true },
)

if (p.value.airlocks.length) state.airlockId = p.value.airlocks[0].id

if (props.mode === 'resource' && p.value.storages.length) {
  const free = p.value.storages.find((s) => !s.full)
  state.moduleId = (free ?? p.value.storages[0]).id
}
</script>

<template>
  <div class="target">
    <div class="seg">
      <button
        v-for="o in options"
        :key="o.value"
        class="ghost"
        :class="{ active: state.kind === o.value }"
        @click="state.kind = o.value"
      >
        {{ o.label }}
      </button>
    </div>

    <div v-if="state.kind === 'coords'" class="row coords">
      <label>X <input type="number" v-model.number="state.x" /></label>
      <label>Y <input type="number" v-model.number="state.y" /></label>
      <label>Z <input type="number" v-model.number="state.z" /></label>
    </div>

    <div v-else-if="state.kind === 'storage'" class="row">
      <select v-model="state.moduleId">
        <option v-for="s in p.storages" :key="s.id" :value="s.id" :disabled="s.full">
          #{{ s.id }} — {{ s.fillPercent }}% full{{ s.full ? ' (full)' : '' }}
        </option>
      </select>
      <span class="muted">stacks by resource height up to real capacity</span>
    </div>

    <div v-else-if="state.kind === 'airlock'" class="row">
      <select v-model="state.airlockId">
        <option v-for="(a, i) in p.airlocks" :key="a.id" :value="a.id">
          Airlock {{ i + 1 }} — #{{ a.id }} ({{ a.pos.x.toFixed(0) }}, {{ a.pos.z.toFixed(0) }})
        </option>
      </select>
      <span class="muted">drops next to the airlock</span>
    </div>
  </div>
</template>

<style scoped>
.target {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.seg {
  display: inline-flex;
  gap: 4px;
  background: var(--bg-2);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border);
  width: fit-content;
  flex-wrap: wrap;
}
.seg button.active {
  background: var(--panel-2);
  color: var(--accent);
  border-color: var(--border);
}
.coords label {
  display: flex;
  gap: 6px;
  align-items: center;
  color: var(--muted);
  font-size: 13px;
}
.coords input {
  width: 90px;
}
</style>
