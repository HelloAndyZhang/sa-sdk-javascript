import { getUA } from './browser'
const hasOwnProperty = Object.prototype.hasOwnProperty
/** 默认空对象 */
export type Arguments = Record<string, any>

export function isObject(arg: Arguments) {
  if (arg == null) {
    return false
  } else {
    return Object.prototype.toString.call(arg) == '[object Object]'
  }
}

export function isString(arg: any) {
  return Object.prototype.toString.call(arg) == '[object String]'
}

export function isArguments(arg: Arguments) {
  return !!(arg && hasOwnProperty.call(arg, 'callee'))
}

export function isBoolean(arg: Arguments) {
  return Object.prototype.toString.call(arg) == '[object Boolean]'
}

export function isEmptyObject(arg: Arguments) {
  if (isObject(arg)) {
    for (const key in arg) {
      if (Object.prototype.hasOwnProperty.call(arg, key)) {
        return false
      }
    }
    return true
  }
  return false
}

export function isElement(arg: any) {
  return !!(arg && arg.nodeType === 1)
}

export function isUndefined(arg: any) {
  return arg === void 0
}

export function isArray(arg: any) {
  if (Array.isArray && isFunction(isArray)) {
    return Array.isArray(arg)
  }
  return Object.prototype.toString.call(arg) === '[object Array]'
}

export function isFunction(arg: any) {
  if (!arg) {
    return false
  }
  const type = Object.prototype.toString.call(arg)
  return type == '[object Function]' || type == '[object AsyncFunction]'
}

export function isHttpUrl(str: string) {
  if (typeof str !== 'string') return false
  const _regex = /^https?:\/\/.+/
  if (_regex.test(str) === false) {
    console.log('Invalid URL')
    return false
  }
  return true
}

export function isIOS() {
  return !!navigator.userAgent.match(/iPhone|iPad|iPod/i)
}

export function isJSONString(str: string) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

export function isNumber(arg: any) {
  return Object.prototype.toString.call(arg) == '[object Number]' && /[\d\.]+/.test(String(arg))
}

export function isSupportBeaconSend() {
  let supported = false
  if (typeof navigator !== 'object' || typeof navigator.sendBeacon !== 'function') {
    return supported
  }

  const Sys = getUA()
  const ua = navigator.userAgent.toLowerCase()
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    const reg = /os [\d._]*/gi
    const verinfo = ua.match(reg)
    const version = (verinfo + '').replace(/[^0-9|_.]/gi, '').replace(/_/gi, '.')
    const ver = version.split('.')
    const minorVer = (ver[0] && Number(ver[0])) || 0
    if (typeof Sys.safari === 'undefined') {
      Sys.safari = minorVer
    }
    if (minorVer && (Sys.qqBuildinBrowser || Sys.qqBrowser)) {
      supported = false
    } else if (minorVer < 13) {
      if (Sys.chrome > 41 || Sys.firefox > 30 || Sys.opera > 25 || Sys.safari > 12) {
        supported = true
      }
    } else if (Sys.chrome > 41 || Sys.firefox > 30 || Sys.opera > 25 || Sys.safari > 11.3) {
      supported = true
    }
  } else {
    if (
      Sys.chrome > 38 ||
      Sys.edge > 13 ||
      Sys.firefox > 30 ||
      Sys.opera > 25 ||
      Sys.safari > 11.0
    ) {
      supported = true
    }
  }
  return supported
}

export function isSupportCors() {
  if (typeof window.XMLHttpRequest === 'undefined') {
    return false
  }
  if ('withCredentials' in new XMLHttpRequest()) {
    return true
    // @ts-ignore
  } else if (typeof XDomainRequest !== 'undefined') {
    return true
  } else {
    return false
  }
}

export const isSupportSessionStorage = () => {
  let supported = true
  const supportName = '__session_storage_support__'
  const val = 'testIsSupportStorage'
  try {
    if (sessionStorage && sessionStorage.setItem) {
      sessionStorage.setItem(supportName, val)
      sessionStorage.removeItem(supportName)
      supported = true
    } else {
      supported = false
    }
  } catch (e) {
    supported = false
  }
  return supported
}
export function isDate(arg: any) {
  return Object.prototype.toString.call(arg) == '[object Date]'
}
