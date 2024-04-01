import { publish } from "libnpmpublish"
import libnpmpack from "libnpmpack"
import pacote from "pacote"
import loading from "loading-cli"
import chalk from "chalk"
import path from "path"
import { checkVersion } from "./checkVersion"
import { EntriesType } from "./interface"
import { node_prompt } from "./prompt"

export const npm_publish = async (packageList: EntriesType[], registry?: string) => {
  /**已存在*/
  const existsList: EntriesType[] = []
  /**发布成功*/
  const successList: EntriesType[] = []
  const failList: EntriesType[] = []
  const load = loading("loading text!!")
  try {
    if (Array.isArray(packageList)) {
      const lg = packageList.length
      for (let index = 0; index < lg; index++) {
        const item = packageList[index];
        const { package: packagePath, tag, name, version, manifest: manifestData } = item
        // load.text = `${name}@${version} 发布中`
        load.start()
        load.text = chalk.rgb(160, 32, 240)(`${name}@${version} 发布中`)
        try {
          let config: any = {}
          if (manifestData && (manifestData as any)?.publishConfig) {
            config = (manifestData as any)?.publishConfig
          }
          let newPath = path.resolve(process.cwd(), packagePath.replace(/\/package\.json/, ''))
          const newRegistry = registry || (config as any)?.registry || 'https://registry.npmjs.org'
          const isPublish = await checkVersion(name, version, newRegistry)
          if (isPublish) {
            const manifest = await pacote.manifest(newPath)
            const tarball = await libnpmpack(newPath)
            try {
              const result = await publish(manifest as any, tarball, {
                access: 'public',
                ...config,
                registry: newRegistry,
                npmVersion: `${name}@${version}`,
                defaultTag: tag || "latest",
                token: process.env.NPM_TOKEN_TEMP,
                forceAuth: {
                  ...(config?.forceAuth || {}),
                  token: process.env.NPM_TOKEN_TEMP,
                },
              })
              load.stop();
              if (result.status === 200) {
                // successList.push(item)
                const txt = chalk.rgb(160, 32, 240)(`🍇 ${item.name}@${item.version} 发布成功`)
                console.log(txt)
              } else {
                failList.push(item)
              }
            } catch (err) {
              load.stop();
              failList.push(item)
              console.log(`💥 ${name} 包发布报错===2==>`, err)
            }
          } else {
            load.stop();
            console.log(chalk.yellowBright(`🍄 ${item.name}@${item.version} 版本已存在`))
            existsList.push(item)
          }
        } catch (err) {
          load.stop();
          console.log(`💥 ${name} 包发布报错===1==>`, err)
        }
      }
    }
  } catch (err) {
    load.stop();
    console.log(err)
  }
  return {
    existsList,
    successList
  }
}

export const npm_publish_log = async (packageList: EntriesType[], registry?: string) => {
  const list: string[] = []
  let max = 0
  /**判断发布包地址是否正确*/
  const registryList = Array.from(new Set(packageList.map((ite) => {
    const newRegistry: string = registry || (ite?.manifest as any)?.registry || 'https://registry.npmjs.org'
    if (newRegistry) {
      return newRegistry.replace(/\/$/g, '')
    }
    return newRegistry
  })))
  let isEach = registryList.length > 1

  packageList.forEach((item) => {
    let text = ''
    const versionText = `${chalk.cyanBright(item.oldVersion)} ${chalk.blueBright("=>")} ${chalk.greenBright(item.version)}`

    if (item.private) {
      text = " 🍄 " + `${chalk.yellowBright(item.name)}${chalk.whiteBright(":")} ${versionText}` + ` (${chalk.red("private")})`
    } else {
      text = " 🍀 " + `${chalk.greenBright(item.name)}${chalk.whiteBright(":")} ${versionText}`
      if (isEach) {
        const newRegistry: string = registry || (item?.manifest as any)?.registry || 'https://registry.npmjs.org'
        text = text + ` NPM registry:${newRegistry}`
      }
    }

    if (text.length > max) {
      max = text.length
    }
    list.push(`${text}`)
  })

  if (list.length) {
    console.log('')
    console.log("🐹🐹 " + chalk.rgb(0, 255, 127)(`NPM registry: ${registry || 'https://registry.npmjs.org'}`))
    console.log("🐹🐹 " + chalk.rgb(0, 255, 127)(`变更：`))
    console.log('')
    list.forEach(text => {
      console.log(text)
    })
    console.log('')
    return await node_prompt(`是否需要进行版本更新？`)
  }

  return Promise.resolve(true)
}


/**注册地址展示*/
export const npm_publish_registry_log = async (packageList: EntriesType[], registry?: string) => {
  const list: string[] = []
  let max = 0
  /**判断发布包地址是否正确*/
  const registryList = Array.from(new Set(packageList.map((ite) => {
    const newRegistry: string = registry || (ite?.manifest as any)?.registry || 'https://registry.npmjs.org'
    if (newRegistry) {
      return newRegistry.replace(/\/$/g, '')
    }
    return newRegistry
  })))
  let isEach = registryList.length > 1

  if (isEach) {
    packageList.forEach((item) => {
      let text = ''
      const versionText = `${chalk.cyanBright(item.oldVersion)} ${chalk.blueBright("=>")} ${chalk.greenBright(item.version)}`
      if (item.private) {
        text = " 🍄 " + `${chalk.yellowBright(item.name)}${chalk.whiteBright(":")} ${versionText}` + ` (${chalk.red("private")})`
      } else {
        const newRegistry: string = registry || (item?.manifest as any)?.registry || 'https://registry.npmjs.org'
        text = " 🍀 " + `${chalk.greenBright(item.name)}${chalk.whiteBright(":")} ${versionText}` + ` NPM registry:${newRegistry}`
      }
      if (text.length > max) {
        max = text.length
      }
      list.push(`${text}`)
    })
  }

  if (list.length) {
    console.log('')
    console.log("🐹🐹 " + chalk.rgb(0, 255, 127)(`NPM registry: ${registry || 'https://registry.npmjs.org'}`))
    console.log("🐹🐹 " + chalk.rgb(0, 255, 127)(`变更：`))
    console.log('')
    list.forEach(text => {
      console.log(text)
    })
    console.log('')
    return await node_prompt(`是否进行发布？`)
  } else {
    console.log('')
    console.log("🐹🐹 " + chalk.rgb(0, 255, 127)(`NPM registry: ${registry || 'https://registry.npmjs.org'}`))
    console.log('')
    return await node_prompt(`是否按照当前地址进行发布？`)
  }
}