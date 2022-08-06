import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { createPinia } from 'pinia'
import './../../../lib/index.min.js'
import '../../../sa-sdk-javascript/dist/sat/sensorsdata-sat.es6.full.js'
import '@styles/reset.less'
import '@styles/nprogress.less'
import 'amfe-flexible'
var sensors = window['sensorsDataAnalytic201505']

// sensors.init({
//   name: 'andyzhang',
//   server_url: 'http://test-syg.datasink.sensorsdata.cn/sa?token=xxxxx&project=xxxxxx',
//   // is_track_single_page: true, // 单页面配置，默认开启，若页面中有锚点设计，需要将该配置删除，否则触发锚点会多触发 $pageview 事件
//   use_client_time: true,
//   send_type: 'beacon',
//   show_log: true,
//   batch_send: true,
// })
// sensors.use('PageLeave')
// sensors.use('PageLoad')
// sensors.use('RegisterPropertyPageHeight')
// sensors.quick('autoTrack')
// sensors.registerPage({
//   uu_current_url: '我是公共属性uu_current_url',
//   uu_referrer: '我是公共属性uu_referrer',
//   1:0,
// })

var ufox = window['uuFoxDataAnalytic']
ufox.init({
  name: 'andyzhang',
  server_url: 'https://baidu.com/xxxx', //
  is_track_single_page: true, // 单页面配置，默认开启，若页面中有锚点设计，需要将该配置删除，否则触发锚点会多触发 $pageview 事件
  use_client_time: true,
  send_type: 'ajax',
  batch_send: true,
  debug_mode: true
})
ufox.registerPage({
  uu_current_url: '我是公共属性uu_current_url',
  uu_referrer: '我是公共属性uu_referrer'
  // user_id:1,
})
ufox.use('PageLeave')
ufox.use('PageLoad')
ufox.use('RegisterPropertyPageHeight')
ufox.quick('autoTrack')
ufox.login('userid=10909090909090')
createApp(App).use(router).use(createPinia()).mount('#app')
