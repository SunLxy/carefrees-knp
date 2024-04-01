import path from "path"
import FS from "fs-extra"
import fastGlob from 'fast-glob'
import chalk from "chalk"
import { OutZipDirsType } from "./interface"
import { create_zip } from "./create_zip"
export * from "./create_zip"
export * from "./interface"

const helpLog = () => {
  console.log(`请在根目录${chalk.red("package.json")}文件中配置`)
  console.log(`格式：
  "name": "包名",
  "zipConfig": {
    "output": "zip",
    "dirs": [
      {
        "path": "core",
        "ignore": [
          "!**/lib",
          "!**/pnpm-lock.yaml"
        ]
      }
    ]
  }
`)
}


export const get_out_zip_config = (rootDir: string): any => {
  const packageJSON = path.resolve(process.cwd(), rootDir, "package.json")
  if (!FS.existsSync(packageJSON)) {
    return undefined
  }
  const packageData = FS.readJSONSync(packageJSON)
  if (!packageData.zipConfig) {
    helpLog()
    return undefined
  }
  const dirs: OutZipDirsType[] = packageData?.zipConfig?.dirs
  if (!Array.isArray(dirs) || (Array.isArray(dirs) && dirs.length === 0)) {
    helpLog()
    return undefined
  }
  return packageData?.zipConfig
}

export const out_zip_dir = async (zipConfig: any) => {
  try {
    const output = zipConfig?.output
    const dirs: OutZipDirsType[] = zipConfig?.dirs
    // 进行数据循环
    const lg = dirs.length;
    const zipLog = []
    for (let index = 0; index < lg; index++) {
      const item = dirs[index];
      const { path: zipPath, name: zipName, output: zipOut = output, ignore: zipIgnore = [], } = item
      const cwd = path.resolve(process.cwd(), zipPath)
      const newName = zipName || path.basename(cwd)
      const outputPath = path.resolve(process.cwd(), zipOut)
      /**判断目录是否存在*/
      if (FS.existsSync(cwd)) {
        const listData = await fastGlob([`${cwd}/**`].concat(zipIgnore).concat(['!**/node_modules/**', '!node_modules/**']), { cwd })
        const newOutPut = path.resolve(outputPath, `${newName}.zip`)
        /**判断输出目录是否存在*/
        if (!FS.existsSync(outputPath)) {
          FS.emptyDirSync(outputPath)
        }
        await create_zip(newOutPut, listData, cwd)
        zipLog.push({ name: `${newName}.zip`, path: newOutPut })
      }

    }
    if (zipLog.length) {
      console.log("")
      console.log(`${chalk.yellowBright(`压缩 zip:`)}`)
      console.log("")
      zipLog.forEach((item) => {
        console.log(`🐶 ${chalk.red(item.name)}: ${chalk.rgb(160, 32, 240)(item.path)}`)
      })
      console.log("")

    }

  } catch (err) {
    console.log(err)
    process.exit()
  }
}