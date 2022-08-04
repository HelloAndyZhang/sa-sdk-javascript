import { isFunction } from '../utils/validate'
import addEvent from './addEvent'

export default function addSinglePageEvent(callback: Function) {
  let current_url = location.href
  const historyPushState = window.history.pushState
  const historyReplaceState = window.history.replaceState

  if (isFunction(window.history.pushState)) {
    window.history.pushState = function (...args) {
      historyPushState.apply(window.history, args)
      callback(current_url)
      current_url = location.href
    }
  }

  if (isFunction(window.history.replaceState)) {
    window.history.replaceState = function (...args) {
      historyReplaceState.apply(window.history, args)
      callback(current_url)
      current_url = location.href
    }
  }

  let singlePageEvent
  // @ts-ignore
  if (window.document.documentMode) {
    singlePageEvent = 'hashchange'
  } else {
    // @ts-ignore
    singlePageEvent = historyPushState ? 'popstate' : 'hashchange'
  }

  addEvent(window, singlePageEvent, function () {
    callback(current_url)
    current_url = location.href
  })
}
