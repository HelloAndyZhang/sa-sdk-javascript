import { extend, isObject, _localStorage, getURL } from './utils'
import { CoreFeature, DataFormatFeature, registerFeature } from './core/stage'
import EventAPI from './core/EventAPI'

export class UUFox extends EventAPI {
  constructor() {
    super()
  }

  init(para: SDKConfig) {
    registerFeature(new CoreFeature())
    registerFeature(new DataFormatFeature())
    this.sdk.emit('beforeInit')
    if (this.readyState && this.readyState.state && this.readyState.state >= 2) {
      return
    }
    this.initSystemEvent()
    this.setInitVar()
    this.readyState.setState(2)
    this.initPara(para)
    this.sdk.emit('afterInitPara')
    this.detectMode()
    this.sdk.emit('afterInit')
  }

  private detectMode() {
    this.trackMode()
  }

  private trackMode() {
    this.readyState.setState(3)
    this.pageInfo.initPage()

    this.listenSinglePage()
    if (!this.para.app_js_bridge && this.para.batch_send && _localStorage.isSupport()) {
      this.batchSend.batchInterval()
    }
    this.store.init()

    // sd.vtrackBase.init()

    this.readyState.setState(4)

    // enterFullTrack()
  }

  listenSinglePage() {
    if (this.para.is_track_single_page) {
      super.listenSinglePage(last_url => {
        const sendData = (extraData?: any) => {
          extraData = extraData || {}
          if (last_url !== location.href) {
            this.pageInfo.pageProp.referrer = getURL(last_url)
            this.quick(
              'autoTrack',
              extend(
                {
                  $url: getURL(),
                  $referrer: getURL(last_url)
                },
                extraData
              )
            )
          }
        }
        if (typeof this.para.is_track_single_page === 'boolean') {
          sendData()
        } else if (typeof this.para.is_track_single_page === 'function') {
          const returnValue = this.para.is_track_single_page()
          if (isObject(returnValue)) {
            sendData(returnValue)
          } else if (returnValue === true) {
            sendData()
          }
        }
      })
    }
  }
}

const ufox: UUFox = new UUFox()
let _ufox = ufox

if (typeof window.uuFoxDataAnalytic === 'undefined') {
  window.uuFoxDataAnalytic = ufox
} else {
  _ufox = window.uuFoxDataAnalytic
}

export default _ufox
