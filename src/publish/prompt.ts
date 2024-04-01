import inquirer from "inquirer"

export const node_prompt = (message: string) => {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message,
      },
    ]).then(answers => {
      resolve(answers.confirm === true)
    }).catch(err => {
      reject(err)
    })
  })
}

export const node_prompt_list = (choices: { value: number | string, name: string | number }[]) => {
  return new Promise((resolve, reject) => {
    inquirer.prompt([{
      type: "list",
      name: "list",
      choices
    }]).then(answers => {
      const findx = choices.find(ite => ite.value === answers.list)
      resolve(findx)
    }).catch(err => {
      reject(err)
    })
  })
}