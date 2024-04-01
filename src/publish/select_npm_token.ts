/**
 * 选择账号进行发布
 * 
 * 通过配置环境变量进行取值
*/
import chalk from "chalk";
import { SelectNpmTokenType } from "./interface"
import { node_prompt_list } from "./prompt"

const colorList: Record<number, chalk.Chalk> = {
  0: chalk.yellow,
  1: chalk.blue,
  2: chalk.green,
  3: chalk.cyan,
  4: chalk.gray,
}

/**总共多少个账号*/
const NPM_TOKEN_COUNT = Number(process.env.NPM_TOKEN_COUNT || 0)

const getTokenMail = (data: string) => {
  if (data) {
    const [mail, token] = data.split(" ").filter(Boolean)
    if (mail && token) {
      return { mail, token }
    }
  }
  return undefined
}

/**获取发布token和邮箱*/
export const get_npm_token = () => {
  try {
    if (NPM_TOKEN_COUNT) {
      const list: SelectNpmTokenType[] = []
      for (let index = 0; index < NPM_TOKEN_COUNT; index++) {
        const data = getTokenMail(process.env[`NPM_TOKEN_PUBLISH_${index}`] as string)
        if (data) {
          list.push(data)
        }
      }
      if (list.length === 0) {
        console.log(`未设置发布npm包token环境变量 ${chalk.yellow("NPM_TOKEN_PUBLISH")} `)
        console.log(`环境变量格式：${chalk.yellowBright("<邮箱> npm_token")}`)
        process.exit()
      }
      return list
    } else if (process.env.NPM_TOKEN_PUBLISH) {
      const data = getTokenMail(process.env.NPM_TOKEN_PUBLISH)
      if (data) {
        return [data]
      }
    }
    console.log(`未设置发布npm包token环境变量 ${chalk.yellow("NPM_TOKEN_PUBLISH")} `)
    console.log(`环境变量格式：${chalk.yellowBright("<邮箱> npm_token")}`)
    process.exit()
  } catch (err) {
    console.log(err)
    process.exit()
  }
}

/**选择 token 进行发布*/
export const select_npm_token = async (list: SelectNpmTokenType[]) => {
  if (list.length > 1) {
    const result = (await node_prompt_list(list.map(((ite, index) => {
      const colorIndex = index % 4
      const color = colorList[colorIndex]
      let text = ite.mail
      if (color)
        text = color(ite.mail)
      return ({ value: ite.token, name: text })
    })))) as { value: string, name: string }
    if (result) {
      return result?.value
    }
  } else if (list.length === 1) {
    const [first] = list
    return first.token
  }
  return undefined
}