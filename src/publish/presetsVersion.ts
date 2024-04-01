/*
 * @Description: 当只有根目录一个包的时候使用
 */

import fs from "fs-extra"
import path from "path"
import { AbbreviatedManifest } from "pacote"
import { node_spawn } from "./spawn"
import { EntriesType } from "./interface"


const updateDep = (obj: Record<string, string>, packageListName: string[], version: string) => {
  const newObj = { ...obj }
  Object.entries(obj).forEach(([k, value]) => {
    if (packageListName.includes(k)) {
      newObj[k] = `^${version}`
    }
  })
  return newObj
}

const updateVersion = (manifest: AbbreviatedManifest, packageListName: string[], version: string) => {
  const newManifest = { ...manifest }
  newManifest.version = version
  const dependencies = manifest.dependencies
  const devDependencies = manifest.devDependencies
  if (dependencies) {
    newManifest.dependencies = updateDep(dependencies, packageListName, version)
  }
  if (devDependencies) {
    newManifest.devDependencies = updateDep(devDependencies, packageListName, version)
  }
  return newManifest
}

const loopUpdateVersions = (packages: EntriesType[]) => {
  const packageListName = packages.map((item) => item.name)
  packages.forEach((item) => {
    const { manifest } = item
    const result = updateVersion(manifest, packageListName, item.version)
    fs.writeJSONSync(path.join(process.cwd(), item.package), result, { encoding: "utf8", spaces: 2, flag: "w+", })
  })
}

export const presetsVersion = async (packages: EntriesType[], version: string) => {
  try {
    loopUpdateVersions(packages)
    const lernaJSON = path.join(process.cwd(), "lerna.json");
    if (fs.existsSync(lernaJSON)) {
      const data = fs.readJsonSync(lernaJSON)
      data.version = version
      fs.writeJSONSync(lernaJSON, data, { encoding: "utf8", spaces: 2, flag: "w+" })
    }
    await node_spawn("git", ["add", "."])
    await node_spawn("git", ["commit", "-m", `released v${version}`])
  } catch (err) {
    console.log("💥 ===执行预设版本报错===>", err)
  }

}