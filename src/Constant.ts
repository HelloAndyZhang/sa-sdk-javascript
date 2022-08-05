export const para_default: ParaDefault = {
  preset_properties: {
    search_keyword_baidu: false,
    latest_utm: true,
    latest_traffic_source_type: true,
    latest_search_keyword: true,
    latest_referrer: true,
    latest_referrer_host: false,
    latest_landing_page: false,
    latest_wx_ad_click_id: undefined,
    url: true,
    title: true
  },
  encrypt_cookie: false,
  enc_cookie: false,
  img_use_crossorigin: false,

  name: 'ufox',
  max_referrer_string_length: 200,
  max_string_length: 500,
  max_id_length: 255,
  max_key_length: 100,
  cross_subdomain: true,
  show_log: false,
  is_debug: false,
  debug_mode: false,
  debug_mode_upload: false,

  source_channel: [],
  sdk_id: '',

  send_type: 'image',

  vtrack_ignore: {},

  auto_init: true,

  is_track_single_page: false,

  is_single_page: false,

  batch_send: false,

  source_type: {},
  callback_timeout: 200,
  datasend_timeout: 8000,
  is_track_device_id: false,
  ignore_oom: true,
  app_js_bridge: false,
  web_url: '',
  server_url: '',
  debug_mode_url: '',
  noCache: false
}

export const source_channel_standard = 'utm_source utm_medium utm_campaign utm_content utm_term'
export const sdkversion_placeholder = '1.0.0'
export const domain_test_key = 'uufox_domain_test'

export const IDENTITY_KEY = {
  EMAIL: '$identity_email',
  MOBILE: '$identity_mobile',
  LOGIN: '$identity_login_id'
}
export const page_hidden_status_refresh_time = 5000
export const sdPara: ParaDefault = para_default
