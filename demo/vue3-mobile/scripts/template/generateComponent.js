const fs = require('fs')
const { vueTemplate } = require('./template')
const utils = require('../utils')
utils.log('请输入要生成的组件名称')
let componentName = ''
process.stdin.on('data', async chunk => {
  const inputName = String(chunk).trim().toString()
  /**
   * 组件目录路径
   */
  const componentDirectory = utils.resolve(`src/components/${inputName}`)

  /**
   * vue组件路径
   */
  const componentVueName = utils.resolve(`${componentDirectory}/index.vue`)

  const hasComponentDirectory = fs.existsSync(componentDirectory)
  if (hasComponentDirectory) {
    utils.errorLog(`${inputName}组件目录已存在，请重新输入`)
    return
  } else {
    utils.log(`正在生成 component 目录 ${componentDirectory}`)
    await dotExistDirectoryCreate(componentDirectory)
  }
  try {
    if (inputName.includes('/')) {
      const inputArr = inputName.split('/')
      componentName = inputArr[inputArr.length - 1]
    } else {
      componentName = inputName
    }
    utils.log(`正在生成 vue 文件 ${componentVueName}`)
    await utils.generateFile(componentVueName, vueTemplate(componentName))
    utils.successLog('生成成功')
  } catch (e) {
    utils.errorLog(e.message)
  }

  process.stdin.emit('end')
})
process.stdin.on('end', () => {
  process.exit()
})
function dotExistDirectoryCreate(directory) {
  return new Promise(resolve => {
    utils.mkdirs(directory, function () {
      resolve(true)
    })
  })
}
