import {
  cookie,
  isJSONString,
  decryptIfNeeded,
  encrypt,
  each,
  _URL,
  hashCode53,
  getURL,
  getReferrerEqid,
  getReferrerEqidType,
  getKeywordFromReferrer,
  getSourceFromReferrer,
  isEmptyObject,
  getWxAdIdFromUrl,
  isReferralTraffic,
  isObject,
  isBaiduTraffic
} from '../utils'
import ufox from '..'
import memory from '../helper/memory'
import { sdPara } from '../Constant'
function getNewUserFlagKey(name_prefix: string, url?: string) {
  let sub = ''
  url = url || location.href
  if (sdPara.cross_subdomain === false) {
    try {
      sub = _URL(url).hostname
    } catch (e) {
      console.log(e)
    }
    if (typeof sub === 'string' && sub !== '') {
      sub = 'ufoxjssdk_2015_' + sdPara.sdk_id + name_prefix + '_' + sub.replace(/\./g, '_')
    } else {
      sub = 'ufoxjssdk_2015_root_' + sdPara.sdk_id + name_prefix
    }
  } else {
    sub = 'ufoxjssdk_2015_cross_' + sdPara.sdk_id + name_prefix
  }
  return sub
}
const getBaiduKeyword = {
  data: {
    id: '',
    type: ''
  },
  id: function () {
    if (this.data.id) {
      return this.data.id
    } else {
      this.data.id = getReferrerEqid()
      return this.data.id
    }
  },
  type: function () {
    if (this.data.type) {
      return this.data.type
    } else {
      this.data.type = getReferrerEqidType()
      return this.data.type
    }
  }
}

class UserInfo {
  is_first_visit_time: boolean
  is_page_first_visited: boolean
  constructor() {
    this.is_first_visit_time = false
    this.is_page_first_visited = false
  }

  isNewUser() {
    const prefix = 'new_user'
    if (cookie.isSupport()) {
      if (
        cookie.get('ufox_is_new_user') !== null ||
        cookie.get(getNewUserFlagKey(prefix)) !== null
      ) {
        return true
      }
      return false
    } else {
      if (memory.get(memory.getNewUserFlagMemoryKey(prefix)) !== null) return true
      return false
    }
  }

  checkIsAddSign(data: any) {
    if (data.type === 'track') {
      if (this.isNewUser()) {
        data.properties.$is_first_day = true
      } else {
        data.properties.$is_first_day = false
      }
    }
  }

  checkIsFirstTime(data: any) {
    if (data.type === 'track' && data.event === '$pageview') {
      if (this.is_first_visit_time) {
        data.properties.$is_first_time = true
        this.is_first_visit_time = false
      } else {
        data.properties.$is_first_time = false
      }
    }
  }

  setDeviceId(uuid: string) {
    let device_id = null
    let ds = cookie.get('ufoxjssdkcross' + ufox.para.sdk_id)
    ds = decryptIfNeeded(ds)
    let state: any = {}
    if (ds != null && isJSONString(ds)) {
      state = JSON.parse(ds)
      if (state.$device_id) {
        device_id = state.$device_id
      }
    }

    device_id = device_id || uuid

    if (ufox.para.cross_subdomain === true) {
      ufox.store.set('$device_id', device_id)
    } else {
      state.$device_id = device_id
      state = JSON.stringify(state)
      if (ufox.para.encrypt_cookie) {
        state = encrypt(state)
      }
      cookie.set('ufoxjssdkcross' + ufox.para.sdk_id, state, null, true)
    }

    if (ufox.para.is_track_device_id) {
      ufox.pageInfo.currentProps.$device_id = device_id
    }
  }

  storeInitCheck() {
    if (ufox.is_first_visitor) {
      const date = new Date()
      const obj: any = {
        h: 23 - date.getHours(),
        m: 59 - date.getMinutes(),
        s: 59 - date.getSeconds()
      }
      if (cookie.isSupport()) {
        cookie.set(getNewUserFlagKey('new_user'), '1', obj.h * 3600 + obj.m * 60 + obj.s + 's')
      } else {
        memory.set(
          memory.getNewUserFlagMemoryKey('new_user'),
          '1',
          obj.h * 3600 + obj.m * 60 + obj.s + 's'
        )
      }
      this.is_first_visit_time = true
      this.is_page_first_visited = true
    } else {
      if (!this.isNewUser()) {
        this.checkIsAddSign = function (data) {
          if (data.type === 'track') {
            data.properties.$is_first_day = false
          }
        }
      }
      this.checkIsFirstTime = function (data) {
        if (data.type === 'track' && data.event === '$pageview') {
          data.properties.$is_first_time = false
        }
      }
    }
  }

  checkIsFirstLatest() {
    let url_domain = ufox.pageInfo.pageProp.url_domain

    const latestObj: any = {}

    if (url_domain === '') {
      url_domain = 'url解析失败'
    }

    const baiduKey = getKeywordFromReferrer(document.referrer, true)
    if (ufox.para.preset_properties.search_keyword_baidu) {
      if (isReferralTraffic(document.referrer)) {
        if (isBaiduTraffic() && !(isObject(baiduKey) && baiduKey.active)) {
          latestObj.$search_keyword_id = getBaiduKeyword.id()
          latestObj.$search_keyword_id_type = getBaiduKeyword.type()
          latestObj.$search_keyword_id_hash = hashCode53(latestObj.$search_keyword_id)
        } else {
          if (ufox.store._state && ufox.store._state.props) {
            ufox.store._state.props.$search_keyword_id &&
              delete ufox.store._state.props.$search_keyword_id
            ufox.store._state.props.$search_keyword_id_type &&
              delete ufox.store._state.props.$search_keyword_id_type
            ufox.store._state.props.$search_keyword_id_hash &&
              delete ufox.store._state.props.$search_keyword_id_hash
          }
        }
      }
    } else {
      if (ufox.store._state && ufox.store._state.props) {
        ufox.store._state.props.$search_keyword_id &&
          delete ufox.store._state.props.$search_keyword_id
        ufox.store._state.props.$search_keyword_id_type &&
          delete ufox.store._state.props.$search_keyword_id_type
        ufox.store._state.props.$search_keyword_id_hash &&
          delete ufox.store._state.props.$search_keyword_id_hash
      }
    }

    ufox.store.save()

    each(ufox.para.preset_properties, (value: string, key: string) => {
      if (key.indexOf('latest_') === -1) {
        return
      }
      key = key.slice(7)
      if (value) {
        if (key === 'wx_ad_click_id' && value === 'not_collect') {
          return
        }
        if (key !== 'utm' && url_domain === 'url解析失败') {
          if (key === 'wx_ad_click_id') {
            latestObj._latest_wx_ad_click_id = 'url的domain解析失败'
            latestObj._latest_wx_ad_hash_key = 'url的domain解析失败'
            latestObj._latest_wx_ad_callbacks = 'url的domain解析失败'
          } else {
            latestObj['$latest_' + key] = 'url的domain解析失败'
          }
        } else if (isReferralTraffic(document.referrer)) {
          switch (key) {
            case 'traffic_source_type':
              latestObj.$latest_traffic_source_type = getSourceFromReferrer()
              break
            case 'referrer':
              latestObj.$latest_referrer = ufox.pageInfo.pageProp.referrer
              break
            case 'search_keyword':
              if (getKeywordFromReferrer()) {
                latestObj.$latest_search_keyword = getKeywordFromReferrer()
              } else if (
                isObject(ufox.store._state) &&
                isObject(ufox.store._state.props) &&
                ufox.store._state.props.$latest_search_keyword
              ) {
                delete ufox.store._state.props.$latest_search_keyword
              }
              break
            case 'landing_page':
              latestObj.$latest_landing_page = getURL()
              break
            case 'wx_ad_click_id':
              var adObj = getWxAdIdFromUrl(location.href)
              latestObj._latest_wx_ad_click_id = adObj.click_id
              latestObj._latest_wx_ad_hash_key = adObj.hash_key
              latestObj._latest_wx_ad_callbacks = adObj.callbacks
              break
          }
        }
      } else {
        if (key === 'utm' && ufox.store._state && ufox.store._state.props) {
          for (const key1 in ufox.store._state.props) {
            if (
              key1.indexOf('$latest_utm') === 0 ||
              (key1.indexOf('_latest_') === 0 && key1.indexOf('_latest_wx_ad_') < 0)
            ) {
              delete ufox.store._state.props[key1]
            }
          }
        } else if (
          ufox.store._state &&
          ufox.store._state.props &&
          '$latest_' + key in ufox.store._state.props
        ) {
          delete ufox.store._state.props['$latest_' + key]
        } else if (
          key == 'wx_ad_click_id' &&
          ufox.store._state &&
          ufox.store._state.props &&
          Boolean(value) === false
        ) {
          const wxPro = [
            '_latest_wx_ad_click_id',
            '_latest_wx_ad_hash_key',
            '_latest_wx_ad_callbacks'
          ]
          each(wxPro, function (value: string) {
            if (value in ufox.store._state.props) {
              delete ufox.store._state.props[value]
            }
          })
        }
      }
    })

    ufox.register(latestObj)

    if (ufox.para.preset_properties.latest_utm) {
      const allUtms = ufox.pageInfo.campaignParamsStandard('$latest_', '_latest_')
      const $utms = allUtms.$utms
      const otherUtms = allUtms.otherUtms
      if (!isEmptyObject($utms)) {
        ufox.register($utms)
      }
      if (!isEmptyObject(otherUtms)) {
        ufox.register(otherUtms)
      }
    }
  }
}

export default new UserInfo()
