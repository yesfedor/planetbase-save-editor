<script setup lang="ts">
import { store } from './store.js'
import SavePicker from './components/SavePicker.vue'
import Editor from './components/Editor.vue'
</script>

<template>
  <div class="app-root">
    <SavePicker v-if="!store.projection" />
    <Editor v-else />

    <div class="toasts">
      <div v-for="t in store.toasts" :key="t.id" class="toast" :class="t.kind">{{ t.text }}</div>
    </div>
  </div>
</template>

<style scoped>
.app-root {
  height: 100%;
}
.toasts {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  z-index: 60;
}
.toasts .toast {
  position: static;
  transform: none;
}
</style>
