const { execSync } = require('child_process')
const argv = require('minimist')(process.argv.slice(2))
const config = require('../../sentry.config')
const utils = require('../utils')
// 删除目前版本的sentry soucremap文件
if (argv.c == 'delete') {
  try {
    execSync(`sentry-cli releases files ${config.sentryName} delete --all`)
    utils.successLog(`${config.sentryName}对应的sourceMap文件已清空`)
  } catch (error) {
    utils.errorLog('删除sourceMap文件出错')
  }
}
