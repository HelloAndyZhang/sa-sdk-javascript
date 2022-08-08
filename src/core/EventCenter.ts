import EventEmitter from '../helper/EventEmitter'
import addSinglePageEvent from '../helper/addSinglePageEvent'
import EventEmitterSa from '../helper/EventEmitterSa'
import check from '../helper/EventCheck'
export default class EventCenter {
  public spa: EventEmitter // 页面监听事件管理
  public sdk: EventEmitter // sdk生命周期事件管理
  public events: EventEmitterSa
  EVENT_LIST: {
    spaSwitch: string[]
    sdkAfterInitPara: string[]
    sdkBeforeInit: string[]
    sdkAfterInit: string[]
  }

  constructor() {
    this.spa = new EventEmitter()
    this.sdk = new EventEmitter()
    this.events = new EventEmitterSa()
    this.EVENT_LIST = {
      spaSwitch: ['spa', 'switch'],
      sdkAfterInitPara: ['sdk', 'afterInitPara'],
      sdkBeforeInit: ['sdk', 'beforeInit'],
      sdkAfterInit: ['sdk', 'afterInit']
    }
  }

  initSystemEvent() {
    addSinglePageEvent((url: string) => {
      this.spa.emit('switch', url)
    })
  }

  listenSinglePage(callback: (url: string) => void) {
    this.spa.on('switch', (last_url: string) => {
      callback && callback(last_url)
    })
  }

  eventEmitterFacade(event_type: string, callback: (...args: any[]) => void) {
    let splitEvent = []
    if (typeof event_type === 'string' && event_type in this.EVENT_LIST) {
      splitEvent = this.EVENT_LIST[event_type]
      this[splitEvent[0]].on(splitEvent[1], callback)
    }
  }

  // 校验参数
  check(p: any, callback?: any) {
    return check(p, callback)
  }
}
