/*
 * @Description: 获取发布版本的根目录
 */
import path from "path";
import fs from "fs-extra"
/**
 * 1. 判断是否存在 lerna.json  文件
 * 2. 判断 package.json 中是否存在  workspaces 字段
 * 
*/
export const getWorkspaces = () => {
  const packageJSON = path.join(process.cwd(), "package.json");
  const lernaJSON = path.join(process.cwd(), "lerna.json");
  let workspace: string[] = []
  let coreTagPath: string | undefined = undefined

  if (fs.existsSync(lernaJSON)) {
    // 取 lerna.jsoon 中 packages 字段值
    workspace = fs.readJSONSync(lernaJSON).packages
    coreTagPath = lernaJSON
  }
  if (fs.existsSync(packageJSON) && (!workspace || (Array.isArray(workspace) && workspace.length === 0))) {
    const json = fs.readJSONSync(packageJSON)
    if (json.workspaces) {
      if (Array.isArray(json.workspaces)) {
        workspace = json.workspaces;
      } else if (json?.workspaces?.packages && Array.isArray(json?.workspaces?.packages)) {
        workspace = json?.workspaces?.packages
      }
      /**默认第一个发布的包*/
      coreTagPath = ''
    } else {
      if (!json.private && json.name && json.version) {
        workspace = ["."]
        coreTagPath = "."
      }
    }
  }
  return {
    workspace: workspace || [],
    coreTagPath
  }
}