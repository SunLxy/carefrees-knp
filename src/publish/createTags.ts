import simpleGit from "simple-git"

const git = simpleGit();

export const createTags = async (version: string) => {

  try {
    const result = await git.checkIsRepo()
    if (result) {
      const { all } = await git.tags()
      const fix = all.find(ite => ite === `v${version}`)
      if (!fix) {
        const resultTag = await git.addTag(`v${version}`)
        if (resultTag.name) {
          console.log(`🦄 git tag ${version} 成功`)
        }
      }
    }
  } catch (err) {
    console.log("===createTags===报错===>", err)
  }
}