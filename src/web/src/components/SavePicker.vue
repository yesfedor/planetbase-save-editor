<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, type ResolvedDirs, type SaveMode } from '../api.js'
import { store } from '../store.js'

const resolved = ref<ResolvedDirs | null>(null)
const files = ref<{ name: string; path: string }[]>([])
const loading = ref(false)
const editingCustom = ref(false)
const customInput = ref('')

async function refresh() {
  loading.value = true
  const s = await store.run(() => api.getSettings())
  if (s) {
    resolved.value = s.resolved
    customInput.value = s.settings.customDir
  }
  const list = await store.run(() => api.listSaves())
  files.value = list?.files ?? []
  loading.value = false
}

async function setMode(mode: SaveMode, customDir?: string) {
  const s = await store.run(() => api.setSettings({ mode, customDir: customDir ?? resolved.value?.customDir ?? '' }))
  if (s) {
    resolved.value = s.resolved
    editingCustom.value = false
    const list = await store.run(() => api.listSaves())
    files.value = list?.files ?? []
  }
}

async function pick(path: string) {
  const p = await store.run(() => api.open(path), 'Save loaded')
  if (p) store.setProjection(p)
}

onMounted(refresh)
</script>

<template>
  <div class="picker">
    <div class="hero card">
      <div class="logo">◈</div>
      <h1>PlanetBase <span>Save Editor</span></h1>
      <p class="muted">Load a colony save and edit resources, colonists, bots and the world map.</p>
    </div>

    <div class="card folder" v-if="resolved">
      <div class="label">Game saves folder</div>
      <div class="seg">
        <button class="ghost" :class="{ active: resolved.mode === 'game' }" :disabled="!resolved.gameExists" @click="setMode('game')">
          🎮 Game
          <span v-if="!resolved.gameExists" class="mini">not found</span>
        </button>
        <button class="ghost" :class="{ active: resolved.mode === 'project' }" @click="setMode('project')">
          📁 Project
        </button>
        <button class="ghost" :class="{ active: resolved.mode === 'custom' }" @click="editingCustom = true; resolved && (customInput = resolved.customDir)">
          ✎ Custom
        </button>
      </div>

      <div class="path">
        {{ resolved.dir }}
        <span v-if="!resolved.exists" class="badge missing">folder not found</span>
      </div>

      <div class="hints">
        <div><span class="dim">Game:</span> {{ resolved.gameDir }} <span v-if="!resolved.gameExists" class="dim">(missing)</span></div>
        <div><span class="dim">Project:</span> {{ resolved.projectDir }}</div>
      </div>

      <div v-if="editingCustom" class="row edit">
        <input v-model="customInput" placeholder="C:\path\to\your\Saves" class="grow" />
        <button class="primary" @click="setMode('custom', customInput)">Use folder</button>
      </div>
    </div>

    <div class="card list">
      <div class="row head">
        <h2>Save files</h2>
        <button @click="refresh" :disabled="loading">↻ Refresh</button>
      </div>
      <div v-if="loading" class="empty muted">Loading…</div>
      <div v-else-if="!files.length" class="empty muted">No .sav files in this folder.</div>
      <ul v-else>
        <li v-for="f in files" :key="f.path" @click="pick(f.path)">
          <span class="file-ico">💾</span>
          <span class="grow">{{ f.name }}</span>
          <span class="badge">open →</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.picker {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.hero {
  padding: 28px;
  text-align: center;
}
.logo {
  font-size: 46px;
  color: var(--accent);
  line-height: 1;
}
h1 {
  margin: 12px 0 6px;
  font-weight: 600;
}
h1 span {
  color: var(--accent);
}
.folder {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.label {
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.seg {
  display: inline-flex;
  gap: 4px;
  background: var(--bg-2);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border);
  width: fit-content;
}
.seg button {
  display: flex;
  align-items: center;
  gap: 7px;
}
.seg button.active {
  background: var(--panel-2);
  color: var(--accent);
  border-color: var(--border);
}
.seg .mini {
  font-size: 11px;
  color: #ff8fa0;
}
.path {
  font-family: 'Cascadia Code', monospace;
  font-size: 13px;
  word-break: break-all;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.hints {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.hints .dim {
  opacity: 0.65;
}
.badge.missing {
  color: #ff8fa0;
  border-color: #5a2531;
}
.list {
  padding: 8px 8px 12px;
}
.head {
  padding: 10px 10px 6px;
}
h2 {
  margin: 0;
  font-size: 15px;
  flex: 1;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
}
li:hover {
  background: var(--panel-2);
}
.empty {
  padding: 22px;
  text-align: center;
}
.file-ico {
  font-size: 18px;
}
</style>
