import {
  _URL,
  getQueryParamsFromUrl,
  isEmptyObject,
  UUID,
  isArray,
  trim,
  getHostname,
  getCookieTopLevelDomain,
  _decodeURI
} from './index'
import { sdPara, domain_test_key } from '../Constant'

export function isReferralTraffic(refererstring?: string) {
  refererstring = refererstring || document.referrer
  if (refererstring === '') {
    return true
  }

  return (
    getCookieTopLevelDomain(getHostname(refererstring), domain_test_key) !==
    getCookieTopLevelDomain(null, domain_test_key)
  )
}

export function getReferrer(referrer?: string | null | boolean, full?: boolean | string) {
  referrer = referrer || document.referrer
  if (typeof referrer !== 'string') {
    return '取值异常_referrer异常_' + String(referrer)
  }
  referrer = trim(referrer)
  referrer = _decodeURI(referrer)
  if (referrer.indexOf('https://www.baidu.com/') === 0 && !full) {
    referrer = referrer.split('?')[0]
  }
  referrer = referrer.slice(0, sdPara.max_referrer_string_length)
  return typeof referrer === 'string' ? referrer : ''
}

export function getReferSearchEngine(referrerUrl: string) {
  const hostname = getHostname(referrerUrl)
  if (!hostname || hostname === 'hostname解析异常') {
    return ''
  }
  const searchEngineUrls = {
    baidu: [/^.*\.baidu\.com$/],
    bing: [/^.*\.bing\.com$/],
    google: [/^www\.google\.com$/, /^www\.google\.com\.[a-z]{2}$/, /^www\.google\.[a-z]{2}$/],
    sm: [/^m\.sm\.cn$/],
    so: [/^.+\.so\.com$/],
    sogou: [/^.*\.sogou\.com$/],
    yahoo: [/^.*\.yahoo\.com$/]
  }
  for (const prop in searchEngineUrls) {
    const urls = searchEngineUrls[prop]
    for (let i = 0, len = urls.length; i < len; i++) {
      if (urls[i].test(hostname)) {
        return prop
      }
    }
  }
  return '未知搜索引擎'
}

export function isBaiduTraffic() {
  const referer = document.referrer
  const endsWith = 'baidu.com'
  if (!referer) {
    return false
  }

  try {
    const hostname = _URL(referer).hostname
    return hostname && hostname.substring(hostname.length - endsWith.length) === endsWith
  } catch (e) {
    return false
  }
}

export function getReferrerEqid() {
  const query: any = getQueryParamsFromUrl(document.referrer)
  if (isEmptyObject(query) || !query.eqid) {
    return UUID().replace(/-/g, '')
  }
  return query.eqid
}

export function getReferrerEqidType() {
  const query: any = getQueryParamsFromUrl(document.referrer)
  if (isEmptyObject(query) || !query.eqid) {
    const url: any = getQueryParamsFromUrl(location.href)
    if (query.ck || url.utm_source) {
      return 'baidu_sem_keyword_id'
    }
    return 'baidu_other_keyword_id'
  }
  return 'baidu_seo_keyword_id'
}

export function getKeywordFromReferrer(
  referrerUrl?: string,
  activeValue?: string | number | boolean
) {
  referrerUrl = referrerUrl || document.referrer
  const search_keyword = sdPara.source_type.keyword
  if (document && typeof referrerUrl === 'string') {
    if (referrerUrl.indexOf('http') === 0) {
      const searchEngine = getReferSearchEngine(referrerUrl)
      const query = getQueryParamsFromUrl(referrerUrl)
      if (isEmptyObject(query)) {
        if (sdPara.preset_properties.search_keyword_baidu && isBaiduTraffic()) {
          return
        } else {
          return '未取到值'
        }
      }
      let temp: any = null
      for (const i in search_keyword) {
        if (searchEngine === i) {
          if (typeof query === 'object') {
            temp = search_keyword[i]
            if (isArray(temp)) {
              for (let i = 0; i < temp.length; i++) {
                const _value = query[temp[i]]
                if (_value) {
                  if (activeValue) {
                    return {
                      active: _value
                    }
                  } else {
                    return _value
                  }
                }
              }
            } else if (query[temp]) {
              if (activeValue) {
                return {
                  active: query[temp]
                }
              } else {
                return query[temp]
              }
            }
          }
        }
      }
      if (sdPara.preset_properties.search_keyword_baidu && isBaiduTraffic()) {
        return
      } else {
        return '未取到值'
      }
    } else {
      if (referrerUrl === '') {
        return '未取到值_直接打开'
      } else {
        return '未取到值_非http的url'
      }
    }
  } else {
    return '取值异常_referrer异常_' + String(referrerUrl)
  }
}

export function getSourceFromReferrer() {
  function getMatchStrFromArr(arr: string, str: string) {
    for (let i = 0; i < arr.length; i++) {
      if (str.split('?')[0].indexOf(arr[i]) !== -1) {
        return true
      }
    }
    return false
  }

  const utm_reg = '(' + sdPara.source_type.utm.join('|') + ')\\=[^&]+'
  const search_engine = sdPara.source_type.search
  const social_engine = sdPara.source_type.social

  const referrer = document.referrer || ''
  // var url = pageInfo.pageProp.url||''
  const url: any = ''
  if (url) {
    const utm_match = url.match(new RegExp(utm_reg))
    if (utm_match && utm_match[0]) {
      return '付费广告流量'
    } else if (getMatchStrFromArr(search_engine, referrer)) {
      return '自然搜索流量'
    } else if (getMatchStrFromArr(social_engine, referrer)) {
      return '社交网站流量'
    } else if (referrer === '') {
      return '直接流量'
    } else {
      return '引荐流量'
    }
  } else {
    return '获取url异常'
  }
}
