import { each } from '../utils'

interface EventItem {
  type: string
  data?: any
  callback?: Function
  context?: any
}
export default class EventEmitterSa {
  private _events: Array<EventItem>
  pendingEvents: Array<EventItem>
  constructor() {
    this._events = []
    this.pendingEvents = []
  }

  emit(type: string, ...args: any[]) {
    each(this._events, function (val: EventItem) {
      if (val.type !== type) {
        return
      }
      val.callback?.apply(val.context, args)
    })

    this.pendingEvents.push({
      type: type,
      data: args
    })
    this.pendingEvents.length > 20 ? this.pendingEvents.shift() : null
  }

  on(event: string, callback: Function, context: any, replayAll: boolean) {
    if (typeof callback !== 'function') {
      return
    }
    this._events.push({
      type: event,
      callback: callback,
      context: context || this
    })

    replayAll = replayAll !== false
    if (this.pendingEvents.length > 0 && replayAll) {
      each(this.pendingEvents, function (val: EventItem) {
        if (val.type === event) {
          callback.apply(context, val.data)
        }
      })
    }
  }

  tempAdd(event: string, data: EventItem) {
    if (!data || !event) {
      return
    }
    return this.emit(event, data)
  }

  isReady() {}
}
