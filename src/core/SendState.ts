import { getRandom, isArray, _localStorage, isSupportBeaconSend, isSupportCors } from '../utils'
import ufox from '..'
import ImageSender from '../helper/ImageSender'
import BeaconSender from '../helper/BeaconSender'
import AjaxSender from '../helper/AjaxSender'
function getSendType(data: any) {
  const supportedSendTypes = ['image', 'ajax', 'beacon']
  let sendType = supportedSendTypes[0]

  if (data.config && supportedSendTypes.indexOf(data.config.send_type) > -1) {
    sendType = data.config.send_type
  } else {
    sendType = ufox.para.send_type
  }

  if (sendType === 'beacon' && isSupportBeaconSend() === false) {
    sendType = 'image'
  }

  if (sendType === 'ajax' && isSupportCors() === false) {
    sendType = 'image'
  }

  return sendType
}

function getSender(data: any) {
  const sendType = getSendType(data)
  switch (sendType) {
    case 'image':
      return new ImageSender(data)
    case 'ajax':
      return new AjaxSender(data)
    case 'beacon':
      return new BeaconSender(data)
    default:
      return new ImageSender(data)
  }
}

function getRealtimeInstance(data: any) {
  const obj = getSender(data)
  const start = obj.start
  obj.start = function (...args: any[]) {
    const me: any = this
    start.apply(this, args)
    setTimeout(function () {
      me.isEnd(true)
    }, ufox.para.callback_timeout)
  }
  // @ts-ignore
  obj.end = function () {
    this.callback && this.callback()
    const self = this
    setTimeout(function () {
      // @ts-ignore
      self.lastClear && self.lastClear()
    }, ufox.para.datasend_timeout - ufox.para.callback_timeout)
  }
  // @ts-ignore
  obj.isEnd = function () {
    // @ts-ignore
    if (!this.received) {
      // @ts-ignore
      this.received = true
      // @ts-ignore
      this.end()
    }
  }
  return obj
}
export default class SendState {
  getSendCall(data: any, config: any, callback: any) {
    if (ufox.is_heatmap_render_mode) {
      return
    }

    if (ufox.readyState.state < 3) {
      ufox.logger.log('初始化没有完成')
      return
    }

    data._track_id = Number(
      String(getRandom()).slice(2, 5) +
        String(getRandom()).slice(2, 4) +
        String(new Date().getTime()).slice(-4)
    )
    data._flush_time = new Date().getTime()

    const originData = data

    data = JSON.stringify(data)

    const requestData = {
      data: originData,
      config: config,
      callback: callback
    }

    ufox.events.tempAdd('send', originData)

    if (
      !ufox.para.app_js_bridge &&
      ufox.para.batch_send &&
      _localStorage.isSupport() &&
      localStorage.length < 100
    ) {
      ufox.batchSend.add(requestData.data)
      return
    }
    this.prepareServerUrl(requestData)
  }

  prepareServerUrl(requestData: any) {
    if (typeof requestData.config === 'object' && requestData.config.server_url) {
      this.sendCall(requestData, requestData.config.server_url, requestData.callback)
    } else if (isArray(ufox.para.server_url) && ufox.para.server_url.length) {
      for (let i = 0; i < ufox.para.server_url.length; i++) {
        this.sendCall(requestData, ufox.para.server_url[i])
      }
    } else if (typeof ufox.para.server_url === 'string' && ufox.para.server_url !== '') {
      this.sendCall(requestData, ufox.para.server_url, requestData.callback)
    } else {
      ufox.logger.log(
        '当前 server_url 为空或不正确，只在控制台打印日志，network 中不会发数据，请配置正确的 server_url！'
      )
    }
  }

  sendCall(
    requestData: { [key: string]: string | object },
    server_url: string,
    callback?: () => void
  ) {
    const data = {
      server_url: server_url,
      data: JSON.stringify(requestData.data),
      callback: callback,
      config: requestData.config
    }
    this.realtimeSend(data)
  }

  realtimeSend(data: any) {
    const instance = getRealtimeInstance(data)
    instance.start()
  }
}
