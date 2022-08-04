const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
module.exports = {
  // 递归创建目录
  mkdirs(directory, callback) {
    const exists = fs.existsSync(directory)
    if (exists) {
      callback()
    } else {
      this.mkdirs(path.dirname(directory), function () {
        fs.mkdirSync(directory)
        callback()
      })
    }
  },
  successLog(message) {
    console.log(chalk.blue(`${message}`))
  },
  errorLog(error) {
    console.log(chalk.red(`${error}`))
  },
  log(message) {
    console.log(chalk.green(`${message}`))
  },
  generateFile(path, data) {
    if (fs.existsSync(path)) {
      this.errorLog(`${path}文件已存在`)
      return
    }
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, 'utf8', err => {
        if (err) {
          this.errorLog(err.message)
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  },
  resolve(dir) {
    return path.resolve(process.cwd(), dir)
  },
  kebabCase(key) {
    const result = key.replace(/([A-Z])/g, ' $1').trim()
    return result.split(' ').join('-').toLowerCase()
  },
  isProd: process.env.NODE_ENV === 'production'
}
