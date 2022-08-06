import { _decodeURIComponent, getCurrentDomain, isString } from './index'
import { sdPara } from '../Constant'

const _cookie = {
  get: function (name: string) {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length)
      }
      if (c.indexOf(nameEQ) === 0) {
        return _decodeURIComponent(c.substring(nameEQ.length, c.length))
      }
    }
    return null
  },
  set: function (
    name: string,
    value: string,
    days?: any,
    _cross_subdomain?: string,
    cookie_samesite?: string,
    is_secure?: boolean,
    domain?: string
  ) {
    const cdomain = domain
    let expires = ''
    let secure = ''
    let samesite = ''
    days = days == null ? 73000 : days

    if (days !== 0) {
      const date = new Date()
      if (String(days).slice(-1) === 's') {
        date.setTime(date.getTime() + Number(String(days).slice(0, -1)) * 1000)
      } else {
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
      }

      expires = '; expires=' + date.toUTCString()
    }
    if (isString(cookie_samesite) && cookie_samesite !== '') {
      samesite = '; SameSite=' + cookie_samesite
    }
    if (is_secure) {
      secure = '; secure'
    }

    function getValid(data: any) {
      if (data) {
        return data.replaceAll(/\r\n/g, '')
      } else {
        return false
      }
    }
    let valid_name = ''
    let valid_value = ''
    let valid_domain = ''
    if (name) {
      valid_name = getValid(name)
    }
    if (value) {
      valid_value = getValid(value)
    }
    if (cdomain) {
      valid_domain = getValid(cdomain)
    }
    if (valid_name && valid_value) {
      document.cookie =
        valid_name +
        '=' +
        encodeURIComponent(valid_value) +
        expires +
        '; path=/' +
        valid_domain +
        samesite +
        secure
    }
  },
  remove: function (name: string, cross_subdomain?: string) {
    this.set(name, '1', -1, cross_subdomain)
  },
  isSupport: function (testKey = 'cookie_support_test', testValue: any = '1') {
    const self = this

    function accessNormal() {
      self.set(testKey, testValue)
      const val = self.get(testKey)
      if (val !== testValue) return false
      self.remove(testKey)
      return true
    }
    return navigator.cookieEnabled && accessNormal()
  }
}

export const cookie = {
  get: function (name: string) {
    return _cookie.get(name)
  },
  set: function (name: string, value: string, days: any, cross_subdomain?: any) {
    let cdomain = ''
    cross_subdomain =
      typeof cross_subdomain === 'undefined' ? sdPara.cross_subdomain : cross_subdomain

    if (cross_subdomain) {
      let domain = getCurrentDomain(location.href)
      if (domain === 'url解析失败') {
        domain = ''
      }
      cdomain = domain ? '; domain=' + domain : ''
    }

    return _cookie.set(
      name,
      value,
      days,
      cross_subdomain,
      sdPara.set_cookie_samesite,
      sdPara.is_secure_cookie,
      cdomain
    )
  },
  remove: function (name: string, cross_subdomain: any) {
    cross_subdomain =
      typeof cross_subdomain === 'undefined' ? sdPara.cross_subdomain : cross_subdomain
    return _cookie.remove(name, cross_subdomain)
  },
  isSupport: function (testKey = 'ufoxjssdk_2015_cookie_access_test', testValue = '1') {
    return _cookie.isSupport(testKey, testValue)
  }
}
