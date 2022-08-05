import {
  extend,
  getURL,
  isDate,
  isObject,
  isString,
  base64Encode,
  _URL,
  _localStorage,
  getHostname,
  isNumber,
  isEmptyObject,
  hashCode,
  searchConfigData
} from '../utils'
import userInfo from './UserInfo'
import ufox from '..'

function addReferrerHost(data: any) {
  const isNotProfileType = !data.type || data.type.slice(0, 7) !== 'profile'
  const defaultHost = '取值异常'
  if (isObject(data.properties)) {
    if (data.properties.$first_referrer) {
      data.properties.$first_referrer_host = getHostname(
        data.properties.$first_referrer,
        defaultHost
      )
    }
    if (isNotProfileType) {
      if ('$referrer' in data.properties) {
        data.properties.$referrer_host =
          data.properties.$referrer === ''
            ? ''
            : getHostname(data.properties.$referrer, defaultHost)
      }
      if (
        ufox.para.preset_properties.latest_referrer &&
        ufox.para.preset_properties.latest_referrer_host
      ) {
        data.properties.$latest_referrer_host =
          data.properties.$latest_referrer === ''
            ? ''
            : getHostname(data.properties.$latest_referrer, defaultHost)
      }
    }
  }
}

function addPropsHook(data: any) {
  const isNotProfileType = !data.type || data.type.slice(0, 7) !== 'profile'
  const isSatisfy = ufox.para.preset_properties && isNotProfileType
  if (isSatisfy && ufox.para.preset_properties.url && typeof data.properties.$url === 'undefined') {
    data.properties.$url = getURL()
  }
  if (
    isSatisfy &&
    ufox.para.preset_properties.title &&
    typeof data.properties.$title === 'undefined'
  ) {
    data.properties.$title = document.title
  }
}
export default class Kit {
  constructor() {}

  buildData(p: any) {
    const data: any = {
      identities: {},
      distinct_id: ufox.store.getDistinctId(),
      lib: {
        $lib: 'js',
        $lib_method: 'code',
        $lib_version: String(ufox.lib_version)
      },
      properties: {}
    }

    if (isObject(p) && isObject(p.identities) && !isEmptyObject(p.identities)) {
      extend(data.identities, p.identities)
    } else {
      extend(data.identities, ufox.store._state.identities)
    }

    if (isObject(p) && isObject(p.properties) && !isEmptyObject(p.properties)) {
      if (p.properties.$lib_detail) {
        data.lib.$lib_detail = p.properties.$lib_detail
        delete p.properties.$lib_detail
      }
      if (p.properties.$lib_method) {
        data.lib.$lib_method = p.properties.$lib_method
        delete p.properties.$lib_method
      }
    }

    extend(data, ufox.store.getUnionId(), p)

    // processAddCustomProps(data);

    if (isObject(p.properties) && !isEmptyObject(p.properties)) {
      extend(data.properties, p.properties)
    }

    if (!p.type || p.type.slice(0, 7) !== 'profile') {
      data.properties = extend(
        {},
        ufox.pageInfo.properties(),
        ufox.store.getProps(),
        ufox.store.getSessionProps(),
        ufox.pageInfo.currentProps,
        data.properties
      )
      if (
        ufox.para.preset_properties.latest_referrer &&
        !isString(data.properties.$latest_referrer)
      ) {
        data.properties.$latest_referrer = '取值异常'
      }
      if (
        ufox.para.preset_properties.latest_search_keyword &&
        !isString(data.properties.$latest_search_keyword)
      ) {
        if (
          !ufox.para.preset_properties.search_keyword_baidu ||
          !isString(data.properties.$search_keyword_id) ||
          !isNumber(data.properties.$search_keyword_id_hash) ||
          !isString(data.properties.$search_keyword_id_type)
        ) {
          data.properties.$latest_search_keyword = '取值异常'
        }
      }
      if (
        ufox.para.preset_properties.latest_traffic_source_type &&
        !isString(data.properties.$latest_traffic_source_type)
      ) {
        data.properties.$latest_traffic_source_type = '取值异常'
      }
      if (
        ufox.para.preset_properties.latest_landing_page &&
        !isString(data.properties.$latest_landing_page)
      ) {
        data.properties.$latest_landing_page = '取值异常'
      }
      if (ufox.para.preset_properties.latest_wx_ad_click_id === 'not_collect') {
        delete data.properties._latest_wx_ad_click_id
        delete data.properties._latest_wx_ad_hash_key
        delete data.properties._latest_wx_ad_callbacks
      } else if (
        ufox.para.preset_properties.latest_wx_ad_click_id &&
        !isString(data.properties._latest_wx_ad_click_id)
      ) {
        data.properties._latest_wx_ad_click_id = '取值异常'
        data.properties._latest_wx_ad_hash_key = '取值异常'
        data.properties._latest_wx_ad_callbacks = '取值异常'
      }
      if (isString(data.properties._latest_wx_ad_click_id)) {
        data.properties.$url = getURL()
      }
    }

    if (data.properties.$time && isDate(data.properties.$time)) {
      data.time = data.properties.$time * 1
      delete data.properties.$time
    } else {
      data.time = new Date().getTime()
    }

    // sd.vtrackBase.addCustomProps(data);
    // parseSuperProperties(data)

    addReferrerHost(data)
    addPropsHook(data)

    userInfo.checkIsAddSign(data)
    userInfo.checkIsFirstTime(data)
    // processFormatData(data);
    return data
  }

  sendData(data: any, callback?: CallBack) {
    const data_config = searchConfigData(data.properties)
    if (ufox.para.debug_mode === true) {
      ufox.logger.log(data)
    }
    ufox.sendState.getSendCall(data, data_config, callback)
  }

  encodeTrackData(data: any) {
    const dataStr = base64Encode(data)
    const crc = 'crc=' + hashCode(dataStr)
    return 'data=' + encodeURIComponent(dataStr) + '&ext=' + encodeURIComponent(crc)
  }

  // 获取渠道来源暂时没有用到
  getUtmData() {
    // return processGetUtmData();
    return {}
  }
}
