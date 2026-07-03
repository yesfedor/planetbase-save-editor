import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  srcDir: 'src/server',
  compatibilityDate: '2025-07-03',
  runtimeConfig: {
    projectRoot: process.cwd(),
  },
})
