
import fastGlob from 'fast-glob'
import path from 'path'
import fs from 'fs-extra'

import { EntriesType } from "./interface"

/** 读取版本信息 **/
export const getVersion = (packagePath: string, newVersion?: string) => {
  const data = fs.readJSONSync(path.join(process.cwd(), packagePath), { encoding: "utf8" })
  try {
    if (data) {
      const oldVersion = data.version
      const version = newVersion || data.version
      const name = data.name
      const priv = data.private
      if (version && name) {
        const bate = /(-|\.)beta(-|\.\w|$)/.test(version)
        const alpha = /(-|\.)alpha(-|\.\w|$)/.test(version)
        const rc = /(-|\.)rc(-|\.\w|$)/.test(version)
        let tag = 'latest'
        if (alpha) {
          tag = 'alpha'
        } else if (bate) {
          tag = 'beta'
        } else if (rc) {
          tag = 'rc'
        }
        return {
          package: packagePath,
          tag,
          version,
          name,
          private: priv,
          oldVersion,
          manifest: data
        }
      }
    }
  } catch (err) {
    throw err
  }
}

const getTags = (coreTagPath: string | undefined, packages: EntriesType[]) => {
  let tagVersion = ''
  if (coreTagPath === "." || coreTagPath === "") {
    const [item] = packages
    // 第一个
    tagVersion = item.version
  } else if (coreTagPath) {
    const lernaJSON = fs.readJSONSync(coreTagPath)
    tagVersion = lernaJSON.version || "0.0.0"
  }
  return tagVersion
}

export const getPackageList = async (workspace: string[]) => {
  const dirs = workspace.map(k => k + '/package.json')
  // console.log(`workspaces package.json:${JSON.stringify(dirs, null, 2)}`)
  const packageList = await fastGlob(dirs.concat(['!**/node_modules/**', '!node_modules/**']))
  return packageList
}

export const getPackages = async (workspace: string[], coreTagPath: string | undefined, version?: string) => {
  try {
    const dirs = workspace.map(k => k + '/package.json')
    // console.log(`workspaces package.json:${JSON.stringify(dirs, null, 2)}`)
    const packageList = await fastGlob(dirs.concat(['!**/node_modules/**', '!node_modules/**']))
    // console.log(`RegExp packages:${JSON.stringify(packageList, null, 2)}`)
    const packages: EntriesType[] = []
    packageList.forEach(packagePath => {
      const result = getVersion(packagePath, version)
      if (result) packages.push(result)
    })
    const tagVersion = version || getTags(coreTagPath, packages)

    return {
      packages,
      tagVersion
    }

  } catch (err) {
    console.log(err)
    process.exit(2)
  }
}