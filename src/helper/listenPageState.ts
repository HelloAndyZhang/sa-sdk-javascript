import { isFunction } from '../utils/validate'
import addEvent from './addEvent'

interface Params {
  visible: () => void
  hidden: () => void
}

export default function listenPageState(obj: Params) {
  const document: Document & {
    msHidden?: boolean
    webkitHidden?: boolean
    mozHidden?: boolean
    [key: string]: any
  } = window.document

  class VisibilyStore {
    visibleHandler: () => void
    hiddenHandler: () => void
    visibilityChange: string
    hidden: string
    constructor() {
      this.visibleHandler = isFunction(obj.visible) ? obj.visible : function () {}
      this.hiddenHandler = isFunction(obj.hidden) ? obj.hidden : function () {}
      this.visibilityChange = ''
      this.hidden = ''
    }

    init() {
      if (typeof document.hidden !== 'undefined') {
        this.hidden = 'hidden'
        this.visibilityChange = 'visibilitychange'
      } else if (typeof document.mozHidden !== 'undefined') {
        this.hidden = 'mozHidden'
        this.visibilityChange = 'mozvisibilitychange'
      } else if (typeof document.msHidden !== 'undefined') {
        this.hidden = 'msHidden'
        this.visibilityChange = 'msvisibilitychange'
      } else if (typeof document.webkitHidden !== 'undefined') {
        this.hidden = 'webkitHidden'
        this.visibilityChange = 'webkitvisibilitychange'
      }
      this.listen()
    }

    isSupport() {
      return typeof document[this.hidden as string] !== 'undefined'
    }

    listen() {
      if (!this.isSupport()) {
        addEvent(window, 'focus', this.visibleHandler)
        addEvent(window, 'blur', this.hiddenHandler)
      } else {
        const _this = this
        addEvent(
          document,
          this.visibilityChange,
          function () {
            if (!document[_this.hidden]) {
              _this.visibleHandler()
            } else {
              _this.hiddenHandler()
            }
          },
          1
        )
      }
    }
  }

  new VisibilyStore().init()
}
