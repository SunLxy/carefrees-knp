/**
 * 1. 根据执行目录查询是否存 lerna.json 
 * 2. 判断 package.json 中是否存在 workspaces 
 *   
*/
import parser, { Arguments } from 'yargs-parser'
import chalk from "chalk"
import loading from "loading-cli"

import { formatVersion } from "./publish/checkVersion"
import { getWorkspaces } from "./publish/getWorkspaces"
import { getPackages } from "./publish/getPackages"
import { npm_publish, npm_publish_log } from "./publish/publish"
import { createTags } from "./publish/createTags"
import { npm_build } from "./publish/npm_build"
import { presetsVersion } from "./publish/presetsVersion"
import { node_prompt } from "./publish/prompt"
import { get_npm_token, select_npm_token } from "./publish/select_npm_token"

import { out_zip_dir, get_out_zip_config } from "./zip"
import { git_zip_commit } from "./zip/commit"

export interface ArgvArguments extends Partial<Arguments> { }

const argv: Partial<ArgvArguments> = parser(process.argv.slice(2), {
  string: ["version", 'registry']
})


function help() {
  console.log('\n  Usage: \x1b[34;1mknp\x1b[0m [publish|zip] [--help|h]');
  console.log('\n  Displays help information.');
  console.log('\n  Options:\n');
  console.log('   --registry                  ', 'npm registry address.');

  console.log('\n  Example:\n');
  console.log('   $ \x1b[35mknp\x1b[0m publish');
  console.log('   $ \x1b[35mknp\x1b[0m zip');
}

const main = async () => {

  try {
    const list = argv._;
    if (!Array.isArray(list) || (Array.isArray(list) && list.length === 0) || argv.h || argv.help) {
      help();
      return
    }
    const scriptName = list[0]
    if (scriptName === "publish") {
      const registry = argv.registry
      const rootPath = process.cwd()
      const text = chalk.green(` ${rootPath} `)
      const versionNumber = formatVersion(argv?.version)
      const isPublish = await node_prompt(`是否确认在 ${text} 目录发布包?`)
      if (!isPublish) return;

      /** 获取 token */
      const tokenList = get_npm_token()
      /**选择发布包的 token */
      const token = await select_npm_token(tokenList)
      /** 判断 token 是否存在*/
      if (!token) {
        console.log(`未设置发布npm包token环境变量: ${chalk.yellow("NPM_TOKEN_PUBLISH")} `)
        console.log(`环境变量格式：${chalk.yellowBright("<邮箱> npm_token")}`)
        process.exit()
      }
      /** 设置临时 token 变量 */
      process.env.NPM_TOKEN_TEMP = token

      const load = loading(chalk.greenBright("加载中..."))

      try {
        load.start()
        await npm_build()
        const { workspace, coreTagPath } = getWorkspaces()
        const { packages, tagVersion } = await getPackages(workspace, coreTagPath, versionNumber)
        load.stop()
        if (versionNumber) {
          /**哪些包进行发布打印并确认*/
          const result = await npm_publish_log(packages, registry)
          if (!result) return
          await presetsVersion(packages, versionNumber)
        }
        console.log("")
        await createTags(tagVersion)
        console.log("")
        const newList = packages.filter((ite) => !ite.private)
        await npm_publish(newList, registry)
        console.log("")
      } catch (err) {
        console.log(err)
      }
    } else if (scriptName === "zip") {
      const config = await get_out_zip_config(process.cwd())
      if (config) {
        await out_zip_dir(config)
        if (config.output)
          await git_zip_commit(config.output)
      }
    }
  } catch (err) {
    console.log(err)
  }

}
main()