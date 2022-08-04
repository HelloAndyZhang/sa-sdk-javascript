import { getCurrentDomain, getReferrer, getURL, getHostname, extend, each } from '../utils'
import ufox from '..'
import { sdkversion_placeholder } from '../Constant'
export default class PageInfo {
  pageProp: {
    referrer: string
    referrer_host: string
    url: string
    url_host: string
    url_domain: string
  }

  currentProps: any
  constructor() {
    this.pageProp = {
      referrer: '',
      referrer_host: '',
      url: '',
      url_host: '',
      url_domain: ''
    }
  }

  initPage() {
    const referrer = getReferrer()
    const url = getURL()
    const url_domain = getCurrentDomain(url)
    if (!url_domain) {
      ufox.logger.debug('url_domain异常_' + url + '_' + url_domain)
    }
    this.pageProp = {
      referrer: referrer,
      referrer_host: referrer ? getHostname(referrer) : '',
      url: url,
      url_host: getHostname(url, 'url_host取值异常'),
      url_domain: url_domain
    }
  }

  campaignParams() {
    return ufox.kit.getUtmData()
  }

  campaignParamsStandard(prefix: string, prefix_add: string) {
    prefix = prefix || ''
    prefix_add = prefix_add || ''
    const utms = this.campaignParams()
    const $utms: any = {}
    const otherUtms: any = {}
    each(utms, function (_v: string, i: string, utms: any) {
      if ((' ' + ufox.source_channel_standard + ' ').indexOf(' ' + i + ' ') !== -1) {
        $utms[prefix + i] = utms[i]
      } else {
        otherUtms[prefix_add + i] = utms[i]
      }
    })
    return {
      $utms: $utms,
      otherUtms: otherUtms
    }
  }

  properties() {
    const viewportHeightValue =
      window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0
    const viewportWidthValue =
      window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0
    const propertiesObj = {
      $timezone_offset: new Date().getTimezoneOffset(),
      $screen_height: Number(screen.height) || 0,
      $screen_width: Number(screen.width) || 0,
      $viewport_height: viewportHeightValue,
      $viewport_width: viewportWidthValue,
      $lib: 'js',
      $lib_version: sdkversion_placeholder
    }
    return propertiesObj
  }

  register(obj: any) {
    extend(this.currentProps, obj)
  }
}
