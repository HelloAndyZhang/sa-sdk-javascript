import { ajax } from '../utils'
import ufox from '..'

export default class AjaxSender {
  callback: (...args: any[]) => void
  server_url: string
  data: string
  constructor(para: Record<string, any>) {
    this.callback = para.callback
    this.server_url = para.server_url
    this.data = ufox.kit.encodeTrackData(para.data)
  }

  start(..._args: any[]) {
    const me: any = this
    ajax({
      url: this.server_url,
      type: 'POST',
      data: this.data,
      credentials: false,
      timeout: ufox.para.datasend_timeout,
      cors: true,
      success: function () {
        me.isEnd()
      },
      error: function () {
        me.isEnd()
      }
    })
  }
}
