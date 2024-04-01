import FS from "fs-extra"
import archiver from "archiver"

/**创建zip文件*/
export const create_zip = async (outputPath: string/**创建zip文件路径*/, listData: string[]/**压缩到zip文件路径*/, cwd: string,/**根目录，用于去除保存文件路径前缀*/) => {
  try {
    const outputZIP = FS.createWriteStream(outputPath);
    const archiveZIP = archiver('zip', {
      zlib: { level: 9 } // 设置压缩级别
    });
    listData.forEach((key) => {
      const name = key.replace(cwd, "")
      archiveZIP.file(key, { name });
    })
    // 完成压缩并将结果输出到文件
    archiveZIP.pipe(outputZIP);
    await archiveZIP.finalize();
  } catch (err) {
    console.log(err)
    process.exit()
  }
}