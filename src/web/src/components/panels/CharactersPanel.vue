<script setup lang="ts">
import { computed, ref } from 'vue'
import { api, type CharacterView } from '../../api.js'
import { store } from '../../store.js'
import TargetPicker from '../TargetPicker.vue'

const props = defineProps<{ kind: 'Colonist' | 'Bot' }>()
const p = computed(() => store.projection!)

const specs = computed(() => (props.kind === 'Colonist' ? p.value.meta.colonistSpecs : p.value.meta.botSpecs))
const vitals = props.kind === 'Colonist'
  ? ['Health', 'Nutrition', 'Hydration', 'Oxygen', 'Sleep', 'Morale']
  : ['Condition', 'Integrity']

const list = computed(() => {
  const q = search.value.trim().toLowerCase()
  const all = p.value.characters.filter((c) => c.kind === props.kind)
  return q ? all.filter((c) => c.name.toLowerCase().includes(q) || c.id.includes(q)) : all
})

const search = ref('')
const addSpec = ref(specs.value[0] ?? '')
const addCount = ref(1)
const spawn = ref<Record<string, unknown>>({ kind: 'camera' })
const editing = ref<CharacterView | null>(null)

function commit(projection: any) {
  store.setProjection(projection)
  store.markDirty()
}

async function add() {
  const spec = addSpec.value || specs.value[0]
  const fn = props.kind === 'Colonist' ? api.addColonists : api.addBots
  const res = await store.run(() => fn(spec, addCount.value, spawn.value), `Added ${addCount.value} ${spec}`)
  if (res) commit(res.projection)
}

async function update(payload: Record<string, unknown>, msg?: string) {
  const res = await store.run(() => api.updateCharacter({ id: editing.value!.id, ...payload }), msg)
  if (res) {
    commit(res.projection)
    editing.value = res.projection.characters.find((c) => c.id === editing.value!.id) ?? null
  }
}

async function maxVitals() {
  for (const v of vitals) await update({ stat: { field: v, value: 1 } })
  store.toast('Vitals maxed', 'ok')
}

async function remove(c: CharacterView) {
  const res = await store.run(() => api.removeCharacter(c.id), `Deleted ${c.name}`)
  if (res) {
    commit(res.projection)
    if (editing.value?.id === c.id) editing.value = null
  }
}

const editName = ref('')
const editStat = ref(vitals[0])
const editStatVal = ref(1)
function openEdit(c: CharacterView) {
  editing.value = c
  editName.value = c.name
}
</script>

<template>
  <div class="panel">
    <div class="left">
      <div class="card add">
        <h3>Add {{ kind }}</h3>
        <div class="field">
          <div class="label">Type</div>
          <select v-model="addSpec">
            <option v-for="s in specs" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="field">
          <div class="label">Count</div>
          <input type="number" min="1" v-model.number="addCount" />
        </div>
        <div class="field">
          <div class="label">Spawn at</div>
          <TargetPicker mode="entity" @update="spawn = $event" />
        </div>
        <button class="primary" @click="add">+ Add {{ kind }}</button>
      </div>
    </div>

    <div class="right card">
      <div class="list-head">
        <h3>{{ list.length }} {{ kind }}<span v-if="list.length !== 1">s</span></h3>
        <input v-model="search" placeholder="Search name or id…" />
      </div>
      <div class="rows">
        <div v-for="c in list" :key="c.id" class="crow" :class="{ sel: editing?.id === c.id }">
          <div class="grow" @click="openEdit(c)">
            <div class="cname">{{ c.name }}</div>
            <div class="cmeta muted">{{ c.spec }} · #{{ c.id }} · ({{ c.pos.x.toFixed(0) }}, {{ c.pos.z.toFixed(0) }})</div>
          </div>
          <button class="ghost" @click="openEdit(c)">Edit</button>
          <button class="danger" @click="remove(c)">✕</button>
        </div>
        <div v-if="!list.length" class="empty muted">No {{ kind.toLowerCase() }}s.</div>
      </div>
    </div>

    <div v-if="editing" class="modal-bg" @click.self="editing = null">
      <div class="modal card">
        <div class="modal-head">
          <h3>Edit {{ editing.name }}</h3>
          <button class="ghost" @click="editing = null">✕</button>
        </div>
        <div class="field">
          <div class="label">Name</div>
          <div class="row">
            <input v-model="editName" class="grow" />
            <button @click="update({ name: editName }, 'Renamed')">Save</button>
          </div>
        </div>
        <div class="field">
          <div class="label">Specialization</div>
          <div class="row">
            <select :value="editing.spec" class="grow" @change="update({ spec: ($event.target as HTMLSelectElement).value }, 'Specialization changed')">
              <option v-for="s in specs" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>
        <div class="field">
          <div class="label">Set stat</div>
          <div class="row">
            <select v-model="editStat">
              <option v-for="v in vitals" :key="v" :value="v">{{ v }}</option>
            </select>
            <input type="number" step="0.1" min="0" max="1" v-model.number="editStatVal" style="width: 90px" />
            <button @click="update({ stat: { field: editStat, value: editStatVal } }, `${editStat} set`)">Apply</button>
            <button class="ghost" @click="maxVitals">Max all vitals</button>
          </div>
        </div>
        <div class="field">
          <div class="label">Position (X / Y / Z)</div>
          <div class="row">
            <input type="number" v-model.number="editing.pos.x" style="width: 90px" />
            <input type="number" v-model.number="editing.pos.y" style="width: 90px" />
            <input type="number" v-model.number="editing.pos.z" style="width: 90px" />
            <button @click="update({ pos: { x: editing!.pos.x, y: editing!.pos.y, z: editing!.pos.z } }, 'Moved')">Move</button>
          </div>
        </div>
        <button class="danger" style="margin-top: 6px" @click="remove(editing)">Delete {{ kind.toLowerCase() }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
  max-width: 1050px;
  margin: 0 auto;
}
h3 {
  margin: 0 0 12px;
  font-size: 14px;
}
.add {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: -20px;
}
.field .label {
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}
.field select,
.field > input {
  width: 100%;
}
.right {
  padding: 12px;
  min-height: 200px;
}
.list-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 4px 12px;
}
.list-head h3 {
  margin: 0;
  flex: 1;
}
.rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.crow {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
}
.crow:hover {
  background: var(--panel-2);
}
.crow.sel {
  border-color: var(--accent);
}
.cname {
  font-weight: 500;
  cursor: pointer;
}
.cmeta {
  font-size: 12px;
}
.empty {
  padding: 24px;
  text-align: center;
}
.modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 12, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}
.modal {
  width: 460px;
  max-width: calc(100vw - 32px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal-head {
  display: flex;
  align-items: center;
}
.modal-head h3 {
  flex: 1;
  margin: 0;
}
</style>
