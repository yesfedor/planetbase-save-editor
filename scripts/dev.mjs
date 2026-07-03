import { spawn } from 'node:child_process'

const NITRO_ENV = { ...process.env, PORT: '3000', NITRO_PORT: '3000', HOST: '127.0.0.1', NITRO_HOST: '127.0.0.1' }
const VITE_ENV = { ...process.env, PORT: '5173' }

const procs = [
  { name: 'nitro', cmd: 'nitro', args: ['dev'], color: '\x1b[36m', env: NITRO_ENV },
  { name: 'vite', cmd: 'vite', args: [], color: '\x1b[35m', env: VITE_ENV },
]

const children = procs.map(({ name, cmd, args, color, env }) => {
  const child = spawn(cmd, args, { shell: true, stdio: ['inherit', 'pipe', 'pipe'], env })
  const tag = `${color}[${name}]\x1b[0m `
  const pipe = (stream) => {
    stream.on('data', (d) => {
      process.stdout.write(
        String(d)
          .split('\n')
          .filter(Boolean)
          .map((l) => tag + l)
          .join('\n') + '\n',
      )
    })
  }
  pipe(child.stdout)
  pipe(child.stderr)
  return child
})

console.log('\x1b[32mDev: nitro API on :3000, web on http://localhost:5173\x1b[0m')

function shutdown() {
  for (const c of children) c.kill()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
