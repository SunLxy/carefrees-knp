import { node_spawn } from "../publish/spawn"
import { node_prompt } from "../publish/prompt"
import chalk from "chalk"
import path from "path"

export const git_zip_commit = async (cwd: string) => {
  try {
    const root = path.resolve(process.cwd(), cwd)
    const result = await node_prompt(`是否在 ${chalk.red(root)} 目录进行 ${chalk.green("git push")} 提交`)
    if (result) {
      await node_spawn("git", ['add', "."], { cwd: root })
      await node_spawn("git", ["commit", "-m", `fix: 更新压缩包 `], { cwd: root })
      await node_spawn("git", ["push"], { cwd: root })
    }
  } catch (err) {
    console.log(err)
    process.exit()
  }


}