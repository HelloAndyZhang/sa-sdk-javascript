import {
  getRandom,
  isNumber,
  isObject,
  getReferrer,
  getURL,
  getURLPath,
  getHostname,
  extend,
  each,
  _localStorage
} from '../utils'
import addEvent from '../helper/addEvent'
import listenPageState from '../helper/listenPageState'
import { UUFox } from '..'
import { page_hidden_status_refresh_time } from '../Constant'

class PageLeave {
  timer: any
  page_hidden_status: boolean
  start_time: number
  page_show_status: boolean
  current_page_url: string
  url: string
  option: any
  heartbeat_interval_time: number
  page_id: number
  storage_name: string
  heartbeat_interval_timer: any
  _: {}
  ufox!: UUFox
  constructor() {
    this.start_time = +new Date()
    this.page_show_status = true
    this.page_hidden_status = false
    this._ = {}
    this.timer = null
    this.current_page_url = document.referrer
    this.url = location.href
    this.option = {}
    this.heartbeat_interval_time = 5000
    this.heartbeat_interval_timer = null
    this.page_id = 0
    this.storage_name = 'ufoxwebjssdkpageleave'
  }

  init(ufox: UUFox, option?: any) {
    if (ufox) {
      this.ufox = ufox
      if (option) {
        this.option = option

        const heartbeat_interval_time = option.heartbeat_interval_time
        if (
          heartbeat_interval_time &&
          (isNumber(heartbeat_interval_time) || isNumber(heartbeat_interval_time * 1)) &&
          heartbeat_interval_time * 1 > 0
        ) {
          this.heartbeat_interval_time = heartbeat_interval_time * 1000
        }
      }

      this.page_id = Number(
        String(getRandom()).slice(2, 5) +
          String(getRandom()).slice(2, 4) +
          String(new Date().getTime()).slice(-4)
      )
      this.addEventListener()
      if (document.hidden === true) {
        this.page_show_status = false
      } else {
        this.addHeartBeatInterval()
      }
      this.log('PageLeave初始化完毕')
    } else {
      this.log('神策JS SDK未成功引入')
    }
  }

  log(message: string) {
    if (this.ufox) {
      this.ufox.logger.debug(message)
    }
  }

  refreshPageEndTimer() {
    const _this = this
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.timer = setTimeout(function () {
      _this.page_hidden_status = false
    }, page_hidden_status_refresh_time)
  }

  hiddenStatusHandler() {
    clearTimeout(this.timer)
    this.timer = null
    this.page_hidden_status = false
  }

  pageStartHandler() {
    this.start_time = +new Date()

    if (!document.hidden === true) {
      this.page_show_status = true
    } else {
      this.page_show_status = false
    }
    this.url = location.href
  }

  pageEndHandler() {
    if (this.page_hidden_status === true) return

    const data = this.getPageLeaveProperties()
    if (this.page_show_status === false) {
      delete data.event_duration
    }
    this.page_show_status = false
    this.page_hidden_status = true
    if (this.isCollectUrl(this.url)) {
      this.ufox.track('$WebPageLeave', data)
    }

    this.refreshPageEndTimer()
    this.delHeartBeatData()
  }

  addEventListener() {
    this.addPageStartListener()
    this.addPageSwitchListener()
    this.addSinglePageListener()
    this.addPageEndListener()
  }

  addPageStartListener() {
    const _this = this
    if ('onpageshow' in window) {
      addEvent(window, 'pageshow', function () {
        _this.pageStartHandler()
        _this.hiddenStatusHandler()
      })
    }
  }

  isCollectUrl(url: string) {
    if (typeof this.option.isCollectUrl === 'function') {
      if (typeof url === 'string' && url !== '') {
        return this.option.isCollectUrl(url)
      } else {
        return true
      }
    } else {
      return true
    }
  }

  addSinglePageListener() {
    const _this = this
    this.ufox &&
      this.ufox.spa.prepend('switch', function (last_url: string) {
        if (last_url !== location.href) {
          _this.url = last_url
          _this.pageEndHandler()
          _this.stopHeartBeatInterval()
          _this.current_page_url = _this.url
          _this.pageStartHandler()
          _this.hiddenStatusHandler()
          _this.startHeartBeatInterval()
        }
      })
  }

  addPageEndListener() {
    const _this = this
    each(['pagehide', 'beforeunload', 'unload'], function (key: any) {
      if ('on' + key in window) {
        addEvent(window, key, function () {
          _this.pageEndHandler()

          _this.stopHeartBeatInterval()
        })
      }
    })
  }

  addPageSwitchListener() {
    const _this = this
    listenPageState({
      visible: function () {
        _this.pageStartHandler()
        _this.hiddenStatusHandler()
        _this.startHeartBeatInterval()
      },
      hidden: function () {
        _this.url = location.href
        _this.pageEndHandler()
        _this.stopHeartBeatInterval()
      }
    })
  }

  addHeartBeatInterval() {
    if (!_localStorage.isSupport()) {
      return
    }
    this.startHeartBeatInterval()
  }

  startHeartBeatInterval() {
    const _this = this
    if (this.heartbeat_interval_timer) {
      this.stopHeartBeatInterval()
    }
    let COLLECT_URL_STATUS = true
    if (!this.isCollectUrl(this.url)) {
      COLLECT_URL_STATUS = false
    }
    this.heartbeat_interval_timer = setInterval(function () {
      COLLECT_URL_STATUS && _this.saveHeartBeatData()
    }, this.heartbeat_interval_time)
    COLLECT_URL_STATUS && this.saveHeartBeatData('is_first_heartbeat')
    this.reissueHeartBeatData()
  }

  stopHeartBeatInterval() {
    clearInterval(this.heartbeat_interval_timer)
    this.heartbeat_interval_timer = null
  }

  saveHeartBeatData(type?: any) {
    const pageleave_properties = this.getPageLeaveProperties()
    const device_time = new Date()
    pageleave_properties.$time = device_time
    if (type === 'is_first_heartbeat') {
      pageleave_properties.event_duration = 3.14
    }

    const data = this.ufox.kit.buildData({
      type: 'track',
      event: '$WebPageLeave',
      properties: pageleave_properties
    })

    // try {
    //   if (sd.bridge.bridge_info.verify_success === 'success') {
    //     data.properties.$time = device_time.getTime()
    //   }
    // } catch (err: any) {
    //   this.log(err.message)
    // }

    data.heartbeat_interval_time = this.heartbeat_interval_time
    this.ufox.store.saveObjectVal(this.storage_name + '-' + this.page_id, data)
  }

  delHeartBeatData(storage_key?: any) {
    _localStorage.remove(storage_key || this.storage_name + '-' + this.page_id)
  }

  reissueHeartBeatData() {
    const storage_length = window.localStorage.length

    for (let i = storage_length - 1; i >= 0; i--) {
      const item_key = window.localStorage.key(i)
      if (
        item_key &&
        item_key !== this.storage_name + '-' + this.page_id &&
        item_key.indexOf(this.storage_name + '-') === 0
      ) {
        const item_value = this.ufox.store.readObjectVal(item_key)
        if (
          isObject(item_value) &&
          new Date().getTime() - item_value.time > item_value.heartbeat_interval_time + 5000
        ) {
          delete item_value.heartbeat_interval_time
          this.ufox.kit.sendData(item_value)
          this.delHeartBeatData(item_key)
        }
      }
    }
  }

  getPageLeaveProperties() {
    let duration = (+new Date() - this.start_time) / 1000
    if (isNaN(duration) || duration < 0) {
      duration = 0
    }
    duration = Number(duration.toFixed(3))

    const referrer = getReferrer(this.current_page_url)
    let viewport_position =
      (document.documentElement && document.documentElement.scrollTop) ||
      window.pageYOffset ||
      (document.body && document.body.scrollTop) ||
      0
    viewport_position = Math.round(viewport_position) || 0
    let data: any = {
      $title: document.title,
      $url: getURL(this.url),
      $url_path: getURLPath(),
      $referrer_host: referrer ? getHostname(referrer) : '',
      $referrer: referrer,
      $viewport_position: viewport_position
    }
    if (duration !== 0) {
      data.event_duration = duration
    }

    data = extend(data, this.option.custom_props)
    return data
  }
}

const pageLeave = new PageLeave()
if (
  window.UUFoxWebJSSDKPlugin &&
  Object.prototype.toString.call(window.UUFoxWebJSSDKPlugin) === '[object Object]'
) {
  window.UUFoxWebJSSDKPlugin.PageLeave = window.UUFoxWebJSSDKPlugin.PageLeave || pageLeave
} else {
  window.UUFoxWebJSSDKPlugin = {
    PageLeave: pageLeave
  }
}

export default pageLeave
