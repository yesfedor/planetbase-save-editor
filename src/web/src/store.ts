import { reactive } from 'vue'
import type { Projection } from './api.js'

interface Toast {
  id: number
  kind: 'ok' | 'err'
  text: string
}

export const store = reactive({
  projection: null as Projection | null,
  toasts: [] as Toast[],
  dirty: false,

  setProjection(p: Projection) {
    this.projection = p
  },

  markDirty() {
    this.dirty = true
  },

  toast(text: string, kind: 'ok' | 'err' = 'ok') {
    const id = Date.now() + Math.random()
    this.toasts.push({ id, kind, text })
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    }, 2600)
  },

  async run<T>(fn: () => Promise<T>, okMsg?: string): Promise<T | undefined> {
    try {
      const res = await fn()
      if (okMsg) this.toast(okMsg, 'ok')
      return res
    } catch (e) {
      this.toast(e instanceof Error ? e.message : String(e), 'err')
      return undefined
    }
  },
})
