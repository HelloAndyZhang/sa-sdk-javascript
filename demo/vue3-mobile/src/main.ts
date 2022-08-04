import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { createPinia } from 'pinia'
import './../../../lib/index.min.js'
// import '../../../sa-sdk-javascript/demo.js'
import '@styles/reset.less'
import '@styles/nprogress.less'
import 'amfe-flexible'
// var sensors = window['sensorsDataAnalytic201505'];

// sensors.init({
//   name: 'andyzhang',
//   server_url: 'http://test-syg.datasink.sensorsdata.cn/sa?token=xxxxx&project=xxxxxx',
//   is_track_single_page: true, // 单页面配置，默认开启，若页面中有锚点设计，需要将该配置删除，否则触发锚点会多触发 $pageview 事件
//   use_client_time: true,
//   send_type: 'beacon',
//   show_log: true,
// })
// sensors.use('PageLeave')
// sensors.use('PageLoad')
// sensors.use('RegisterPropertyPageHeight')
// sensors.quick('autoTrack')

var ufox = window['uuFoxDataAnalytic']
ufox.init({
  name: 'andyzhang',
  server_url: 'https://baidu.com', //
  is_track_single_page: true, // 单页面配置，默认开启，若页面中有锚点设计，需要将该配置删除，否则触发锚点会多触发 $pageview 事件
  use_client_time: true,
  send_type: 'ajax',
  batch_send: false,
  debug_mode: true
})
ufox.use('PageLeave')
ufox.use('PageLoad')
ufox.use('RegisterPropertyPageHeight')
createApp(App).use(router).use(createPinia()).mount('#app')
