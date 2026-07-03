<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../../api.js'
import { store } from '../../store.js'

const p = computed(() => store.projection!)
const name = ref(p.value.colony.name)

const landing = computed(() => Object.entries(p.value.colony.landing))
function isBool(k: string) {
  return /allowed/i.test(k)
}

function commit(projection: any) {
  store.setProjection(projection)
  store.markDirty()
}

async function rename() {
  const res = await store.run(() => api.renameColony(name.value), 'Colony renamed')
  if (res) commit(res.projection)
}

async function setLanding(key: string, value: string | number) {
  const res = await store.run(() => api.setLanding(key, value))
  if (res) commit(res.projection)
}

const enabledTechs = computed(() => new Set(p.value.techs))

async function toggleTech(id: string) {
  const next = new Set(p.value.techs)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  const res = await store.run(() => api.setTechs([...next]))
  if (res) commit(res.projection)
}

async function setAllTechs(on: boolean) {
  const ids = on ? p.value.meta.techs.map((t) => t.id) : []
  const res = await store.run(() => api.setTechs(ids), on ? 'All techs unlocked' : 'All techs removed')
  if (res) commit(res.projection)
}
</script>

<template>
  <div class="panel">
    <div class="card block">
      <h3>Colony name</h3>
      <div class="row">
        <input v-model="name" class="grow" />
        <button class="primary" @click="rename">Rename</button>
      </div>
    </div>

    <div class="card block">
      <h3>Landing permissions</h3>
      <div v-if="!landing.length" class="muted">This save has no landing-permissions node.</div>
      <div v-for="[key, value] in landing" :key="key" class="lrow">
        <span class="lname">{{ key }}</span>
        <template v-if="isBool(key)">
          <div class="seg">
            <button class="ghost" :class="{ active: value === 'True' }" @click="setLanding(key, 'True')">On</button>
            <button class="ghost" :class="{ active: value === 'False' }" @click="setLanding(key, 'False')">Off</button>
          </div>
        </template>
        <template v-else>
          <input
            type="number"
            :value="value"
            min="0"
            style="width: 90px"
            @change="setLanding(key, ($event.target as HTMLInputElement).value)"
          />
        </template>
      </div>
    </div>

    <div class="card block">
      <div class="techs-head">
        <h3>Technologies</h3>
        <div class="row">
          <button class="primary" @click="setAllTechs(true)">Unlock all</button>
          <button class="ghost" @click="setAllTechs(false)">Clear</button>
        </div>
      </div>
      <p class="muted hint">Unlocked techs let you build bots and bigger module versions without buying them from traders.</p>
      <label v-for="t in p.meta.techs" :key="t.id" class="tech-row" :class="{ on: enabledTechs.has(t.id) }">
        <input type="checkbox" :checked="enabledTechs.has(t.id)" @change="toggleTech(t.id)" />
        <span class="tech-name">{{ t.label }}</span>
        <span class="muted mono">{{ t.id }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.panel {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.block {
  padding: 18px;
}
h3 {
  margin: 0 0 14px;
  font-size: 14px;
}
.lrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.lname {
  font-size: 14px;
}
.seg {
  display: inline-flex;
  gap: 4px;
  background: var(--bg-2);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--border);
}
.seg button.active {
  background: var(--panel-2);
  color: var(--accent);
}
.techs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.techs-head h3 {
  margin: 0;
}
.hint {
  margin: 6px 0 14px;
  font-size: 12px;
}
.tech-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
.tech-row:hover {
  background: var(--panel-2);
}
.tech-row.on {
  border-color: #234b44;
  background: rgba(56, 214, 200, 0.06);
}
.tech-row input {
  width: 17px;
  height: 17px;
  accent-color: var(--accent);
  cursor: pointer;
}
.tech-name {
  flex: 1;
  font-size: 14px;
}
.mono {
  font-family: 'Cascadia Code', monospace;
  font-size: 11px;
}
</style>
