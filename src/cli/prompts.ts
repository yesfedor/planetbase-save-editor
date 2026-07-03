import * as p from '@clack/prompts'

export function bail(value: unknown): void {
  if (p.isCancel(value)) {
    p.cancel('Cancelled')
    process.exit(0)
  }
}

export async function selectOne<T>(message: string, options: { value: T; label: string; hint?: string }[]): Promise<T> {
  const res = await p.select({ message, options: options as any })
  bail(res)
  return res as T
}

export async function askInt(message: string, opts: { min?: number } = {}): Promise<number> {
  const res = await p.text({
    message,
    validate(v) {
      const n = Number(v)
      if (!Number.isFinite(n) || !Number.isInteger(n)) return 'Enter an integer'
      if (opts.min !== undefined && n < opts.min) return `Must be >= ${opts.min}`
      return undefined
    },
  })
  bail(res)
  return Number(res)
}

export async function askFloat(message: string): Promise<number> {
  const res = await p.text({
    message,
    validate(v) {
      return Number.isFinite(Number(v)) ? undefined : 'Enter a number'
    },
  })
  bail(res)
  return Number(res)
}

export async function askText(message: string, initialValue?: string): Promise<string> {
  const res = await p.text({ message, initialValue })
  bail(res)
  return String(res)
}
