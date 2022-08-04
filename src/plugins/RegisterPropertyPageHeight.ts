import { extend } from '../utils'
import { UUFox } from '..'

let _sd: UUFox
let _oldBuildData: any
let logger: any = (window.console && window.console) || function () {}

function buildData(p: any) {
  try {
    if (p.event !== '$pageview' && (!p.type || p.type.slice(0, 7) !== 'profile')) {
      const viewportHeightValue =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight ||
        0
      const scrollHeightValue = document.documentElement.scrollHeight || 0
      const prop = {
        $page_height: Math.max(viewportHeightValue, scrollHeightValue) || 0
      }
      p.properties = extend(p.properties || {}, prop)
    }
  } catch (e) {
    logger.log('页面高度获取异常。')
  }
  return _oldBuildData.call(_sd.kit, p)
}

const RegisterPropertyPageHeight = {
  init: function (sd: UUFox) {
    _sd = sd
    logger = (_sd && _sd?.logger) || logger

    if (!sd || !sd.kit || !sd.kit.buildData) {
      logger.log(
        'RegisterPropertyPageHeight 插件初始化失败,当前主sdk不支持 RegisterPropertyPageHeight 插件，请升级主sdk'
      )
      return
    }
    _oldBuildData = _sd.kit.buildData
    _sd.kit.buildData = buildData
    logger.log('RegisterPropertyPageHeight 插件初始化完成')
  }
}

if (
  window.UUFoxWebJSSDKPlugin &&
  Object.prototype.toString.call(window.UUFoxWebJSSDKPlugin) === '[object Object]'
) {
  window.UUFoxWebJSSDKPlugin.RegisterPropertyPageHeight =
    window.UUFoxWebJSSDKPlugin.RegisterPropertyPageHeight || RegisterPropertyPageHeight
} else {
  window.UUFoxWebJSSDKPlugin = {
    RegisterPropertyPageHeight: RegisterPropertyPageHeight
  }
}

export default RegisterPropertyPageHeight
