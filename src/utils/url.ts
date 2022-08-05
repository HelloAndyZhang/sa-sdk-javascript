import { isString, isArray } from './validate'
import { trim } from './string'
import { URLParser } from '../helper/URLParser'
import { encodeTrackData, _decodeURIComponent } from './encode'
import { domain_test_key, sdPara } from '../Constant'
export function _decodeURI(uri: string) {
  let result = uri
  try {
    result = decodeURI(uri)
  } catch (e) {
    result = uri
  }
  return result
}

export function getURL(url?: string) {
  if (url && isString(url)) {
    url = trim(url)
    return _decodeURI(url)
  } else {
    return _decodeURI(location.href)
  }
}

export function getURLPath(url_path?: any) {
  if (isString(url_path)) {
    url_path = trim(url_path)
    return _decodeURI(url_path)
  } else {
    return _decodeURI(location.pathname)
  }
}

export function getURLSearchParams(queryString: string) {
  queryString = queryString || ''
  const args: Record<string, any> = {}
  const query = queryString.substring(1)
  const pairs = query.split('&')
  for (let i = 0; i < pairs.length; i++) {
    const pos = pairs[i].indexOf('=')
    if (pos === -1) continue
    let name = pairs[i].substring(0, pos)
    let value = pairs[i].substring(pos + 1)
    name = _decodeURIComponent(name)
    value = _decodeURIComponent(value)
    args[name] = value
  }
  return args
}

export function _URL(url: string) {
  let result: any = {}
  const isURLAPIWorking = function () {
    let url
    try {
      url = new URL('http://modernizr.com/')
      return url.href === 'http://modernizr.com/'
    } catch (e) {
      return false
    }
  }
  if (typeof window.URL === 'function' && isURLAPIWorking()) {
    result = new URL(url)
    if (!result.searchParams) {
      result.searchParams = (function () {
        const params = getURLSearchParams(result.search)
        return {
          get: function (searchParam: any) {
            return params[searchParam]
          }
        }
      })()
    }
  } else {
    if (!isString(url)) {
      url = String(url)
    }
    url = trim(url)
    const _regex = /^https?:\/\/.+/
    if (_regex.test(url) === false) {
      console.log('Invalid URL')
      return
    }
    const instance = new URLParser(url)
    result.hash = instance._values.Fragment
    result.host = instance._values.Host
      ? instance._values.Host + (instance._values.Port ? ':' + instance._values.Port : '')
      : ''
    result.href = instance._values.URL
    result.password = instance._values.Password
    result.pathname = instance._values.Path
    result.port = instance._values.Port
    result.search = instance._values.QueryString ? '?' + instance._values.QueryString : ''
    result.username = instance._values.Username
    result.hostname = instance._values.Hostname
    result.protocol = instance._values.Protocol ? instance._values.Protocol + ':' : ''
    result.origin = instance._values.Origin
      ? instance._values.Origin + (instance._values.Port ? ':' + instance._values.Port : '')
      : ''
    result.searchParams = (function () {
      const params = getURLSearchParams('?' + instance._values.QueryString)
      return {
        get: function (searchParam: string) {
          return params[searchParam]
        }
      }
    })()
  }
  return result
}
export function getHostname(url: string, defaultValue?: string) {
  if (!defaultValue || typeof defaultValue !== 'string') {
    defaultValue = 'hostname解析异常'
  }
  let hostname = null
  try {
    hostname = _URL(url)?.hostname
  } catch (e) {
    console.log('getHostname传入的url参数不合法！')
  }
  return hostname || defaultValue
}

export function getSendUrl(url: any, data: any) {
  const dataStr = encodeTrackData(data)
  if (url.indexOf('?') !== -1) {
    return url + '&' + dataStr
  }
  return url + '?' + dataStr
}

export function getSafeHostname(hostname: string) {
  if (typeof hostname === 'string' && hostname.match(/^[a-zA-Z0-9\u4e00-\u9fa5\-\.]+$/)) {
    return hostname
  } else {
    return ''
  }
}

export function getCookieTopLevelDomain(hostname: string | null, testFlag: string) {
  hostname = hostname || location.hostname
  testFlag = testFlag || 'domain_test'

  const new_hostname = getSafeHostname(hostname)
  const splitResult = new_hostname.split('.')
  if (isArray(splitResult) && splitResult.length >= 2 && !/^(\d+\.)+\d+$/.test(new_hostname)) {
    let domainStr = '.' + splitResult.splice(splitResult.length - 1, 1)
    while (splitResult.length > 0) {
      domainStr = '.' + splitResult.splice(splitResult.length - 1, 1) + domainStr
      document.cookie = testFlag + '=true; path=/; domain=' + domainStr
      if (document.cookie.indexOf(testFlag + '=true') !== -1) {
        const nowDate = new Date()
        nowDate.setTime(nowDate.getTime() - 1000)

        document.cookie =
          testFlag +
          '=true; expires=' +
          nowDate.toUTCString() +
          '; path=/; SameSite=Lax; domain=' +
          domainStr
        return domainStr
      }
    }
  }
  return ''
}

export function getCurrentDomain(url: string) {
  const sdDomain = sdPara.current_domain
  switch (typeof sdDomain) {
    case 'function':
      var resultDomain = sdDomain()
      if (resultDomain === '' || trim(resultDomain) === '') {
        return 'url解析失败'
      } else if (resultDomain.indexOf('.') !== -1) {
        return resultDomain
      } else {
        return 'url解析失败'
      }
    case 'string':
      if (sdDomain === '' || trim(sdDomain) === '') {
        return 'url解析失败'
      } else if (sdDomain.indexOf('.') !== -1) {
        return sdDomain
      } else {
        return 'url解析失败'
      }
    default:
      var cookieTopLevelDomain = getCookieTopLevelDomain(null, domain_test_key)
      if (url === '') {
        return 'url解析失败'
      } else if (cookieTopLevelDomain === '') {
        return 'url解析失败'
      } else {
        return cookieTopLevelDomain
      }
  }
}

export function getQueryParam(url: string, key: string) {
  key = key.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
  url = _decodeURIComponent(url)
  const regexS = '[\\?&]' + key + '=([^&#]*)'
  const regex = new RegExp(regexS)
  const results: any = regex.exec(url)
  if (results === null || (results && typeof results[1] !== 'string' && results[1].length)) {
    return ''
  } else {
    return _decodeURIComponent(results[1])
  }
}

export function getQueryParamsFromUrl(url: string) {
  let result = {}
  const arr = url.split('?')
  const queryString = arr[1] || ''
  if (queryString) {
    result = getURLSearchParams('?' + queryString)
  }
  return result
}
export function getWxAdIdFromUrl(url: string) {
  const click_id = getQueryParam(url, 'gdt_vid')
  const hash_key = getQueryParam(url, 'hash_key')
  const callbacks = getQueryParam(url, 'callbacks')
  const obj = {
    click_id: '',
    hash_key: '',
    callbacks: ''
  }
  if (isString(click_id) && click_id.length) {
    obj.click_id = click_id.length == 16 || click_id.length == 18 ? click_id : '参数解析不合法'

    if (isString(hash_key) && hash_key.length) {
      obj.hash_key = hash_key
    }
    if (isString(callbacks) && callbacks.length) {
      obj.callbacks = callbacks
    }
  }

  return obj
}
