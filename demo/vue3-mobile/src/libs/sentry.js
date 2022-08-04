import Vue from 'vue'
import * as Sentry from '@sentry/vue'
import sentryConfig from '../../sentry.config'
import { version } from '../../package.json'
export default {
  // sentry初始化
  init() {
    Sentry.init({
      Vue,
      dsn: sentryConfig.dsn, // 需要替换为自己的项目sentry地址
      release: `${sentryConfig.release}@${version}`, // 当前sentry项目以及版本号
      autoSessionTracking: false // 不启用性能监控
    })
  },
  /**
   * 设置平台plat
   */
  setPlat(plat) {
    // 设置标签  平台
    Sentry.configureScope(scope => {
      scope.setTag('plat', plat)
    })
  },
  /**
   * 附加数据
   */
  setExtra(data) {
    // 附加数据
    Sentry.configureScope(scope => {
      scope.setExtra('extraData', data)
    })
  },
  /**
   * 设置用户信息
   */
  setUser(userinfo) {
    Sentry.configureScope(scope => {
      scope.setUser({
        id: userinfo.UserId,
        username: userinfo.Mobile
      })
    })
  },
  /**
   * 上传异常
   */
  throw(error, level = 'error') {
    Sentry.captureMessage(error, level)
  },
  /**
   * @method 上报异常附加参数
   * @param {Object} data
   * @param {String} mesaage
   */
  updateErrorMessage(data, mesaage = '') {
    this.setExtra(data)
    this.throw(mesaage)
  }
}
