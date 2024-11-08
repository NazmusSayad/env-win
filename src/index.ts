import { spawnSync } from 'child_process'

export type Scope = 'Machine' | 'User'

export class EnvError extends Error {
  name = 'EnvError' as const
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code
    this.message = message
  }
}

export function execPwshCommand(command: string) {
  const result = spawnSync('powershell', ['-c', command])
  if (result.status !== 0) {
    throw new EnvError(result.status ?? 1, result.stderr.toString().trim())
  }

  return result.stdout.toString().trim()
}

export function readEnv(name: string, scope: Scope) {
  return execPwshCommand(
    `[System.Environment]::GetEnvironmentVariable("${name}", [System.EnvironmentVariableTarget]::${scope})`
  )
}

export function writeEnv(name: string, value: string, scope: Scope) {
  return execPwshCommand(
    `[System.Environment]::SetEnvironmentVariable("${name}", "${value}", [System.EnvironmentVariableTarget]::${scope})`
  )
}

export function addToPath(scope: Scope, ...paths: string[]) {
  const existingPath = readEnv('PATH', scope)
  const existingPathArray = existingPath.split(';').filter((p) => p)
  const newPath = [...new Set([...existingPathArray, ...paths])].join(';')
  return writeEnv('PATH', newPath, scope)
}
