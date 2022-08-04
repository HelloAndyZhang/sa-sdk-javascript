const path = require('path')
const fs = require('fs')
const { vueTemplate } = require('./template')
const utils = require('../utils')
utils.log('请输入要生成的页面名称、会生成在 src/views/目录下')
let componentName = ''
process.stdin.on('data', async chunk => {
  const inputName = String(chunk).trim().toString()
  /**
   * Vue页面组件路径
   */
  let componentVueName = utils.resolve(`src/views/${inputName}`)
  // 如果不是以 .vue 结尾的话，自动加上
  if (!componentVueName.endsWith('.vue')) {
    componentVueName += '.vue'
  }
  /**
   * vue组件目录路径
   */
  const componentDirectory = path.dirname(componentVueName)

  const hasComponentExists = fs.existsSync(componentVueName)
  if (hasComponentExists) {
    utils.errorLog(`${inputName}页面组件已存在，请重新输入`)
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
