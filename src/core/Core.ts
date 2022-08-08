import ReadyState from './ReadState'
import {
  extend,
  isObject,
  isArray,
  _localStorage,
  isSupportCors,
  trim,
  isString,
  getURL,
  isFunction,
  each,
  getURLPath,
  getHostname
} from '../utils'
import PageInfo from './PageInfo'
import SendState from './SendState'
import EventCenter from './EventCenter'
import Store from './Store'
import Logger from '../helper/Logger'
import Kit from './kit'
import BatchSend from './BatchSend'
import userInfo from './UserInfo'
import { para_default, sdkversion_placeholder, source_channel_standard, sdPara } from '../Constant'
import * as modules from '../plugins'

class Core extends EventCenter {
  private _t: number
  public lib_version: string
  public is_first_visitor: boolean
  public source_channel_standard: string
  public is_heatmap_render_mode: boolean
  public para!: ParaDefault
  readonly logger: Logger
  public pageInfo: PageInfo
  public readyState: ReadyState
  public sendState: SendState
  public store: Store
  public modules: any
  public batchSend: BatchSend
  public kit: Kit
  constructor(...args: []) {
    super(...args)
    this.logger = new Logger({ id: '[uFox]', enabled: true })
    this.readyState = new ReadyState()
    this.sendState = new SendState()
    this.pageInfo = new PageInfo()
    this.store = new Store()
    this.batchSend = new BatchSend()
    this.kit = new Kit()
    this._t = 0
    this.lib_version = sdkversion_placeholder
    this.is_first_visitor = true
    this.is_heatmap_render_mode = false
    this.source_channel_standard = source_channel_standard
    this.modules = modules
  }

  initPara(para: SDKConfig) {
    extend(sdPara, para || this.para || {})
    this.para = sdPara

    this.para.preset_properties = extend(
      {},
      para_default.preset_properties,
      this.para.preset_properties || {}
    )
    let i
    for (i in para_default) {
      if (this.para[i] === void 0) {
        this.para[i] = (para_default as ParaDefault)[i]
      }
    }
    if (typeof this.para.server_url === 'string') {
      this.para.server_url = trim(this.para.server_url)
      if (this.para.server_url) {
        if (this.para.server_url.slice(0, 3) === '://') {
          this.para.server_url = location.protocol.slice(0, -1) + this.para.server_url
        } else if (this.para.server_url.slice(0, 2) === '//') {
          this.para.server_url = location.protocol + this.para.server_url
        } else if (this.para.server_url.slice(0, 4) !== 'http') {
          this.para.server_url = ''
        }
      }
    }

    if (
      typeof this.para.web_url === 'string' &&
      (this.para.web_url.slice(0, 3) === '://' || this.para.web_url.slice(0, 2) === '//')
    ) {
      if (this.para.web_url.slice(0, 3) === '://') {
        this.para.web_url = location.protocol.slice(0, -1) + this.para.web_url
      } else {
        this.para.web_url = location.protocol + this.para.web_url
      }
    }

    if (
      this.para.send_type !== 'image' &&
      this.para.send_type !== 'ajax' &&
      this.para.send_type !== 'beacon'
    ) {
      this.para.send_type = 'image'
    }

    const batch_send_default = {
      datasend_timeout: 6000,
      send_interval: 6000
    }
    if (_localStorage.isSupport() && isSupportCors() && typeof localStorage === 'object') {
      if (this.para.batch_send === true) {
        this.para.batch_send = extend({}, batch_send_default)
      } else if (typeof this.para.batch_send === 'object') {
        this.para.batch_send = extend({}, batch_send_default, this.para.batch_send)
      }
    } else {
      this.para.batch_send = false
    }

    const utm_type = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    const search_type = [
      'www.baidu.',
      'm.baidu.',
      'm.sm.cn',
      'so.com',
      'sogou.com',
      'youdao.com',
      'google.',
      'yahoo.com/',
      'bing.com/',
      'ask.com/'
    ]
    const social_type = [
      'weibo.com',
      'renren.com',
      'kaixin001.com',
      'douban.com',
      'qzone.qq.com',
      'zhihu.com',
      'tieba.baidu.com',
      'weixin.qq.com'
    ]
    const search_keyword = {
      baidu: ['wd', 'word', 'kw', 'keyword'],
      google: 'q',
      bing: 'q',
      yahoo: 'p',
      sogou: ['query', 'keyword'],
      so: 'q',
      sm: 'q'
    }

    if (typeof this.para.source_type === 'object') {
      this.para.source_type.utm = isArray(this.para.source_type.utm)
        ? this.para.source_type.utm.concat(utm_type)
        : utm_type
      this.para.source_type.search = isArray(this.para.source_type.search)
        ? this.para.source_type.search.concat(search_type)
        : search_type
      this.para.source_type.social = isArray(this.para.source_type.social)
        ? this.para.source_type.social.concat(social_type)
        : social_type
      this.para.source_type.keyword = isObject(this.para.source_type.keyword)
        ? extend(search_keyword, this.para.source_type.keyword)
        : search_keyword
    }

    if (isArray(this.para.server_url) && this.para.server_url?.length) {
      for (i = 0; i < this.para.server_url.length; i++) {
        if (!/sa\.gif[^/]*$/.test(this.para.server_url[i])) {
          this.para.server_url[i] = this.para.server_url[i]
            .replace(/\/sa$/, '/sa.gif')
            .replace(/(\/sa)(\?[^/]+)$/, '/sa.gif$2')
        }
      }
    } else if (
      !/sa\.gif[^/]*$/.test(this.para.server_url) &&
      typeof this.para.server_url === 'string'
    ) {
      this.para.server_url = this.para.server_url
        .replace(/\/sa$/, '/sa.gif')
        .replace(/(\/sa)(\?[^/]+)$/, '/sa.gif$2')
    }
    if (typeof this.para.server_url === 'string') {
      this.para.debug_mode_url =
        this.para.debug_mode_url || this.para.server_url.replace('sa.gif', 'debug')
    }
    if (this.para.noCache === true) {
      this.para.noCache = '?' + new Date().getTime()
    } else {
      this.para.noCache = ''
    }

    if (this.para?.callback_timeout > this.para?.datasend_timeout) {
      this.para.datasend_timeout = this.para.callback_timeout
    }
  }

  setInitVar() {
    this._t = this._t || new Date().getTime()
    this.lib_version = sdkversion_placeholder
    this.is_first_visitor = false
    this.source_channel_standard = source_channel_standard
  }

  getPresetProperties() {
    const getUtm = () => {
      const utms = this.pageInfo.campaignParams()
      const $utms = {}
      each(utms, (_v: any, i: any, utms: any) => {
        if ((' ' + this.source_channel_standard + ' ').indexOf(' ' + i + ' ') !== -1) {
          $utms['$' + i] = utms[i]
        } else {
          $utms[i] = utms[i]
        }
      })
      return $utms
    }

    const obj = {
      $is_first_day: userInfo.isNewUser(),
      $is_first_time: userInfo.is_page_first_visited,
      $referrer: this.pageInfo.pageProp.referrer || '',
      $referrer_host: this.pageInfo.pageProp.referrer
        ? getHostname(this.pageInfo.pageProp.referrer)
        : '',
      $url: getURL(),
      $url_path: getURLPath(),
      $title: document.title || '',
      _distinct_id: this.store.getDistinctId(),
      identities: JSON.parse(JSON.stringify(this.store._state.identities))
    }
    const result = extend({}, this.pageInfo.properties(), this.store.getProps(), getUtm(), obj)
    if (
      this.para.preset_properties.latest_referrer &&
      this.para.preset_properties.latest_referrer_host
    ) {
      result.$latest_referrer_host =
        result.$latest_referrer === '' ? '' : getHostname(result.$latest_referrer)
    }
    return result
  }

  use(name: string, option?: { [key: string]: any }) {
    if (!isString(name)) {
      this.logger.log('use插件名称必须是字符串！')
      return false
    }

    if (
      isObject(window.UUFoxWebJSSDKPlugin) &&
      isObject(window.UUFoxWebJSSDKPlugin[name]) &&
      isFunction(window.UUFoxWebJSSDKPlugin[name].init)
    ) {
      window.UUFoxWebJSSDKPlugin[name].init(this, option)
      return window.UUFoxWebJSSDKPlugin[name]
    } else if (
      isObject(this.modules) &&
      isObject(this.modules[name]) &&
      isFunction(this.modules[name].init)
    ) {
      this.modules[name].init(this, option)
      return this.modules[name]
    } else {
      this.logger.log(name + '没有获取到,请查阅文档，调整' + name + '的引入顺序！')
    }
  }
}

export default Core
