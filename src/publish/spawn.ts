import { spawn, SpawnOptionsWithoutStdio } from 'child_process'

export const node_spawn = async (cmd: string, arg: string[], options?: SpawnOptionsWithoutStdio) => {
  return new Promise((resolve, reject) => {
    try {
      const gitSpawn = spawn(cmd, arg, options)
      gitSpawn.on('close', () => {
        resolve(true)
      })
    } catch (err) {
      reject(err)
    }
  })
}