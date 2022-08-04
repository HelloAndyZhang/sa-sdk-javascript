function isValidListener(listener: EventListener | Listener): boolean {
  if (typeof listener === 'function') {
    return true
  } else if (listener && typeof listener === 'object') {
    return isValidListener(listener.listener)
  } else {
    return false
  }
}
type Listener = (...args: any[]) => void
interface EventListener {
  listener: Listener
  once: boolean
}
export default class EventEmitter {
  private _events: { [key: string]: Array<EventListener> }
  constructor() {
    this._events = {}
  }

  on(eventName: string, listener: any) {
    if (!eventName || !listener) {
      return false
    }

    if (!isValidListener(listener)) {
      throw new Error('listener must be a function')
    }

    this._events[eventName] = this._events[eventName] || []
    const listenerIsWrapped = typeof listener === 'object'

    this._events[eventName].push(
      listenerIsWrapped
        ? listener
        : ({
            listener: listener,
            once: false
          } as EventListener)
    )

    return this
  }

  prepend(eventName: string, listener: any) {
    if (!eventName || !listener) {
      return false
    }

    if (!isValidListener(listener)) {
      throw new Error('listener must be a function')
    }

    this._events[eventName] = this._events[eventName] || []
    const listenerIsWrapped = typeof listener === 'object'
    this._events[eventName].unshift(
      listenerIsWrapped
        ? listener
        : ({
            listener: listener,
            once: false
          } as EventListener)
    )

    return this
  }

  prependOnce(eventName: string, listener: Listener) {
    return this.prepend(eventName, {
      listener: listener,
      once: true
    })
  }

  once(eventName: string, listener: Listener) {
    return this.on(eventName, {
      listener: listener,
      once: true
    })
  }

  off(eventName: string, listener: Function | number) {
    const listeners = this._events[eventName]
    if (!listeners) {
      return false
    }
    if (typeof listener === 'number') {
      listeners.splice(listener, 1)
    } else if (typeof listener === 'function') {
      for (let i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i] && listeners[i].listener === listener) {
          listeners.splice(i, 1)
        }
      }
    }
    return this
  }

  emit(eventName: string, args?: object | string | number | boolean) {
    const listeners = this._events[eventName]
    if (!listeners) {
      return false
    }

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      if (listener) {
        listener.listener.call(this, args || {})
        if (listener.once) {
          this.off(eventName, i)
        }
      }
    }

    return this
  }

  removeAllListeners(eventName: string) {
    if (eventName && this._events[eventName]) {
      this._events[eventName] = []
    } else {
      this._events = {}
    }
  }

  listeners(eventName: string) {
    if (eventName && typeof eventName === 'string') {
      return this._events[eventName]
    } else {
      return this._events
    }
  }
}
