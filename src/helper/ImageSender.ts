import { getUA, getSendUrl } from '../utils'
import ufox from '..'

export default class ImageSender {
  callback: () => void
  img: HTMLImageElement
  data: Record<string, any>
  server_url: string
  constructor(para: Record<string, any>) {
    this.callback = para.callback
    this.img = document.createElement('img')
    this.img.width = 1
    this.img.height = 1
    if (ufox.para.img_use_crossorigin) {
      this.img.crossOrigin = 'anonymous'
    }
    this.data = para.data
    this.server_url = getSendUrl(para.server_url, para.data)
  }

  start(..._args: any[]) {
    const me: any = this
    if (ufox.para.ignore_oom) {
      this.img.onload = function () {
        this.onload = null
        this.onerror = null
        this.onabort = null
        me.isEnd()
      }
      this.img.onerror = function () {
        this.onload = null
        this.onerror = null
        this.onabort = null
        me.isEnd()
      }
      this.img.onabort = function () {
        this.onload = null
        this.onerror = null
        this.onabort = null
        me.isEnd()
      }
    }
    this.img.src = this.server_url
  }

  lastClear() {
    const sys = getUA()
    if (sys.ie !== undefined) {
      this.img.src = 'about:blank'
    } else {
      this.img.src = ''
    }
  }
}
