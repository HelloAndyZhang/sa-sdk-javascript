// @ts-nocheck
import { ry } from './DomElementInfo'
export default function addEvent(target, eventName, eventHandler, useCapture?: boolean | number) {
  function fixEvent(event) {
    if (event) {
      event.preventDefault = fixEvent.preventDefault
      event.stopPropagation = fixEvent.stopPropagation
      event._getPath = fixEvent._getPath
    }
    return event
  }
  fixEvent._getPath = function () {
    const ev = this
    return this.path || (this.composedPath && this.composedPath()) || ry(ev.target).getParents()
  }

  fixEvent.preventDefault = function () {
    this.returnValue = false
  }
  fixEvent.stopPropagation = function () {
    this.cancelBubble = true
  }

  const register_event = function (element, type, handler) {
    if (useCapture === undefined && type === 'click') {
      useCapture = true
    }
    if (element && element.addEventListener) {
      element.addEventListener(
        type,
        function (e) {
          e._getPath = fixEvent._getPath
          handler.call(this, e)
        },
        useCapture
      )
    } else {
      const ontype = 'on' + type
      const old_handler = element[ontype]
      element[ontype] = makeHandler(element, handler, old_handler, type)
    }
  }

  function makeHandler(element, new_handler, old_handlers, type) {
    const handler = function (event) {
      event = event || fixEvent(window.event)
      if (!event) {
        return undefined
      }
      event.target = event.srcElement

      let ret = true
      let old_result, new_result
      if (typeof old_handlers === 'function') {
        old_result = old_handlers(event)
      }
      new_result = new_handler.call(element, event)
      if (type !== 'beforeunload') {
        if (old_result === false || new_result === false) {
          ret = false
        }
        return ret
      }
    }
    return handler
  }

  register_event.apply(null, arguments)
}

export function addHashEvent(callback) {
  const hashEvent = 'pushState' in window.history ? 'popstate' : 'hashchange'
  addEvent(window, hashEvent, callback)
}
