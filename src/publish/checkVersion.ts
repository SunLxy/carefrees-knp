/**
 * 检测版本是否存在
 */
import { packument } from 'pacote'
export const checkVersion = async (packageName: string, version: string, registry: string) => {
  try {
    const pckmnt = await packument(packageName, {
      fullMetadata: true,
      preferOnline: true,
      silent: true,
      registry,
    })
    return !pckmnt.versions[version]
  } catch (err) {
    const statusCode = (err as any).statusCode
    //当前包不存在，可以发布
    if (statusCode === 404) {
      return true
    }
  }
  // 包不能进行发布
  return false
}
/**格式化版本*/
export const formatVersion = (version?: string) => {
  if (!version) {
    return undefined
  }
  if (/^[0-9]/.test(version)) {
    return version
  }
  const newVersion = `${version}`.toLowerCase().replace(/^v/, "")
  if (/^[0-9]/.test(newVersion)) {
    return version
  }
  return undefined
}