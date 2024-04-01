import fs from 'fs-extra'
import path from 'path'
import { node_spawn } from "./spawn"

export const npm_build = async () => {
  // 判断根目录是否存在 npm run build 命令
  const jsonPath = path.join(process.cwd(), "package.json")
  if (!fs.existsSync(jsonPath)) {
    return true
  }
  const jsonData = fs.readJSONSync(jsonPath)
  const isBuild = jsonData?.scripts?.build
  if (!isBuild) {
    return true
  }
  try {
    await node_spawn("npm", ["run", "build"])
  } catch (err) {
    console.log("💥 ====打包====报错====>", err)
    process.exit()
  }
}