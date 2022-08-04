import ufox from '..'

export default class BeaconSender {
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
    if (typeof navigator === 'object' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(this.server_url, this.data)
    }
    setTimeout(function () {
      me.isEnd()
    }, 40)
  }
}
