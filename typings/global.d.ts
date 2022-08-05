interface Window {
  UUFoxWebJSSDKPlugin: any
  attachEvent: any
  detachEvent: any
  webkitPerformance: any
  msPerformance: any
  mozPerformance: any
  getMatchedCSSRules: any
  msCrypto: any
  uuFoxDataAnalytic: any
}
declare interface SDKConfig {
  sdk_url: string // sensorsdata.min.js 文件的地址。	请从 GitHub 获取并且放在你们自己网站目录下。
  name: string // 	 SDK 使用的一个默认的全局变量，如定义成 sensors 的话，后面可以使用 sensors.track() 用来跟踪信息。为了防止变量名重复，你可以修改成其他名称比如 sensorsdata 等 。
  web_url: string // 无	神策分析后台地址，神策分析中点击分析及触达分析功能会用到此地址，代码生成工具会自动生成。如果神策后台版本及 sensorsdata.min.js 均是 1.10 及以上版本，这个参数不需要配置；如果需要解决热力图引起的 XSS 漏洞问题，Web SDK 需要升级到 v1.21.13 版本，同时配置此参数。
  server_url: string | Array<string> // 	无	数据接收地址。
  heatmap_url?: string // 	无	heatmap.min.js 文件的地址。神策分析中点击分析及触达分析功能代码，代码生成工具会自动生成。如果神策代码中 sensorsdata.min.js 版本是 1.13.1 及以前版本，这个参数须配置，高于此版本不需要配置。
  heatmap?: unknown //	无	点击图配置。默认配置表示不自动采集元素点击事件和页面停留事件，配置成 {} 表示开启 $WebClick 采集 和 $WebStay 自动采集，默认 $WebClick 只采集 a，button，input ，textarea 四个 dom 元素的点击事件。
  cross_subdomain?: boolean // 	无	设置成 true 后，表示在根域下设置 cookie 。也就是如果你有 zhidao.baidu.com 和 tieba.baidu.com 两个域，且有一个用户在同一个浏览器都登录过这两个域的话，我们会认为这个用户是一个用户。如果设置成 false 的话，会认为是两个用户。
  show_log?: boolean // 	无	是否显示 log，默认为 false。
  use_client_time?: boolean // 	无	客户端系统时间的不准确，会导致发生这个事件的时间有误，所以这里默认为 false ，表示不使用客户端时间，使用服务端时间，如果设置为 true 表示使用客户端系统时间。如果你在属性中加入 {$time: new Date()} ，注意这里必须是 Date 类型，那么这条数据就会使用你在属性中传入的这个时间。
  source_channel?: string[] // 	无	设置来源渠道，默认为空。
  send_type?: string // 默认 beacon 表示使用 beacon 请求方式发数据，可选使用 'image' 图片 get 请求方式发数据。( 神策系统 1.10 版本以后 ) 支持使用 'ajax' 和 'beacon' 方式发送数据，这两种默认都是 post 方式， beacon 方式兼容性较差。
  max_string_length?: number // 	无	设置字符串最大长度，默认为 1000。
  callback_timeout?: number // 300 ，单位毫秒	表示队列发送超时时间，如果数据发送时间超过 queue_timeout 还未返回结果，会强制发送下一条数据。
  queue_timeout?: number // 表示队列发送超时时间，如果数据发送时间超过 queue_timeout 还未返回结果，会强制发送下一条数据。
  datasend_timeout?: number //	3000 ，单位毫秒	表示数据发送超时时间，如果数据发送超过 datasend_timeout 还未返回结果，会强制取消该请求。
  preset_properties?: object // 	无	是否开启 $latest 最近一次相关事件属性采集以及配置 $url 作为公共属性，默认值为一个对象。
  is_track_single_page?: boolean // 表示是否开启单页面自动采集 $pageview 功能，SDK 会在 url 改变之后自动采集web页面浏览事件 $pageview。
  batch_send?: boolean // false	表示不开启批量发送，设置为 true 表示开启批量采集。
}

declare interface ParaDefault {
  callback_timeout: number
  web_url: any
  server_url: any
  preset_properties: {
    search_keyword_baidu: boolean
    latest_utm: boolean
    latest_traffic_source_type: boolean
    latest_search_keyword: boolean
    latest_referrer: boolean
    latest_referrer_host: boolean
    latest_landing_page: boolean
    latest_wx_ad_click_id: undefined
    url: boolean
    title: boolean
  }
  encrypt_cookie: boolean
  enc_cookie: boolean
  img_use_crossorigin: boolean
  name: string
  max_referrer_string_length: number
  max_string_length: number
  max_id_length: number
  max_key_length: number
  cross_subdomain: boolean
  show_log: boolean
  is_debug: boolean
  debug_mode: boolean
  debug_mode_upload: boolean
  source_channel: string[]
  sdk_id: string
  send_type: string
  vtrack_ignore: {}
  auto_init: boolean
  is_track_single_page: boolean | Function
  is_single_page: boolean
  batch_send: boolean | any
  source_type: any
  datasend_timeout: number
  is_track_device_id: boolean
  ignore_oom: boolean
  app_js_bridge: boolean
  debug_mode_url: string
  noCache: boolean | string
  current_domain?: string | ((...rest: any[]) => string)
  is_secure_cookie?: boolean
  set_cookie_samesite?: string
}

declare interface Properties {
  $url: string
  $title: string
  $url_path: string
  $referrer: string
  event_duration?: number
  $latest_referrer: string
  $latest_search_keyword: string
  $latest_traffic_source_type: string
  $lib: string
  $lib_version: string
  $page_height: number
  $page_resource_size: number
  $referrer_host: string
  $screen_height: number
  $screen_width: number
  $timezone_offset: number
  $viewport_height: number
  $viewport_width: number
  not_set_profile: boolean
}

declare type CallBack = (...rest: unknown[]) => void
