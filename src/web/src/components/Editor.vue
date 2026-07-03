<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { api } from '../api.js'
import { store } from '../store.js'
import OverviewPanel from './panels/OverviewPanel.vue'
import ResourcesPanel from './panels/ResourcesPanel.vue'
import CharactersPanel from './panels/CharactersPanel.vue'
import ColonyPanel from './panels/ColonyPanel.vue'

const MapPanel = defineAsyncComponent(() => import('./panels/MapPanel.vue'))

const tabs = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'resources', label: 'Resources', icon: '❒' },
  { id: 'colonists', label: 'Colonists', icon: '☺' },
  { id: 'bots', label: 'Bots', icon: '⬡' },
  { id: 'colony', label: 'Colony', icon: '⚑' },
  { id: 'map', label: '3D Map', icon: '◎' },
]
const tab = ref('overview')
const saveMenu = ref(false)
const p = computed(() => store.projection!)

async function doSave(strategy: 'new-file' | 'overwrite') {
  saveMenu.value = false
  const res = await store.run(() => api.save(strategy))
  if (res) {
    store.dirty = false
    store.toast(`Saved → ${res.path.split(/[\\/]/).pop()}${res.backupPath ? ' (backup created)' : ''}`, 'ok')
  }
}

function back() {
  store.projection = null
  store.dirty = false
}
</script>

<template>
  <div class="editor">
    <header class="topbar">
      <button class="ghost" @click="back">←</button>
      <div class="title">
        <div class="colony">{{ p.colony.name || 'Unnamed colony' }}</div>
        <div class="sub muted">{{ p.file }} · v{{ p.version }}</div>
      </div>
      <span v-if="store.dirty" class="badge dirty">● unsaved</span>
      <div class="save-wrap">
        <button class="primary" @click="saveMenu = !saveMenu">Save ▾</button>
        <div v-if="saveMenu" class="menu card">
          <button class="ghost" @click="doSave('new-file')">
            <b>New file</b><span class="muted">writes *_modified.sav</span>
          </button>
          <button class="ghost" @click="doSave('overwrite')">
            <b>Overwrite</b><span class="muted">replaces original, keeps .bak</span>
          </button>
        </div>
      </div>
    </header>

    <nav class="tabs">
      <button v-for="t in tabs" :key="t.id" :class="{ active: tab === t.id }" class="ghost" @click="tab = t.id">
        <span class="ico">{{ t.icon }}</span>{{ t.label }}
      </button>
    </nav>

    <main class="content">
      <OverviewPanel v-if="tab === 'overview'" @go="tab = $event" />
      <ResourcesPanel v-else-if="tab === 'resources'" />
      <CharactersPanel v-else-if="tab === 'colonists'" kind="Colonist" />
      <CharactersPanel v-else-if="tab === 'bots'" kind="Bot" />
      <ColonyPanel v-else-if="tab === 'colony'" />
      <MapPanel v-else-if="tab === 'map'" />
    </main>
  </div>
</template>

<style scoped>
.editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-2);
}
.ghost {
  background: transparent;
  border-color: transparent;
}
.ghost:hover {
  background: var(--panel-2);
  border-color: var(--border);
}
.title {
  flex: 1;
}
.colony {
  font-weight: 600;
  font-size: 16px;
}
.sub {
  font-size: 12px;
}
.badge.dirty {
  color: var(--accent-2);
  border-color: #5a422a;
}
.save-wrap {
  position: relative;
}
.menu {
  position: absolute;
  right: 0;
  top: 44px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 230px;
  z-index: 20;
}
.menu button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  text-align: left;
}
.menu .muted {
  font-size: 12px;
}
.tabs {
  display: flex;
  gap: 4px;
  padding: 8px 14px 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg-2);
  overflow-x: auto;
}
.tabs button {
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid transparent;
  display: flex;
  gap: 7px;
  align-items: center;
  white-space: nowrap;
}
.tabs button.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  background: var(--panel);
}
.ico {
  opacity: 0.8;
}
.content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
</style>
