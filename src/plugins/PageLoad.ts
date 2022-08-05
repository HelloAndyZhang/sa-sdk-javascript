import { isNumber, getReferrer, getURL, getURLPath } from '../utils'
import { UUFox } from '..'

class PageLoad {
  init(sd: UUFox) {
    function getPageSize(p: any, prop: any) {
      if (p.getEntries && typeof p.getEntries === 'function') {
        const entries = p.getEntries()

        let totalSize = 0
        for (let i = 0; i < entries.length; i++) {
          if ('transferSize' in entries[i]) {
            totalSize += entries[i].transferSize
          }
        }

        if (isNumber(totalSize) && totalSize >= 0 && totalSize < 10737418240) {
          prop.$page_resource_size = Number((totalSize / 1024).toFixed(3))
        }
      }
    }

    function fn() {
      const p =
        window.performance ||
        window.webkitPerformance ||
        window.msPerformance ||
        window.mozPerformance
      let duration = 0
      const prop: Partial<Properties> = {
        $url: getURL(),
        $title: document.title,
        $url_path: getURLPath(),
        $referrer: getReferrer(null, true)
      }

      if (!p || !p.timing) {
        sd.logger.log('浏览器未支持 performance API.')
      } else {
        const t = p.timing
        if (t.fetchStart === 0 || t.domContentLoadedEventEnd === 0) {
          sd.logger.log('performance 数据获取异常')
        } else {
          duration = t.domContentLoadedEventEnd - t.fetchStart
        }
        getPageSize(p, prop)
      }
      if (duration > 0) {
        prop.event_duration = Number((duration / 1000).toFixed(3))
      }
      sd.track('$WebPageLoad', prop)

      if (window.removeEventListener) {
        window.removeEventListener('load', fn)
      } else if (window.detachEvent) {
        window.detachEvent('onload', fn)
      }
    }

    if (document.readyState == 'complete') {
      fn()
    } else if (window.addEventListener) {
      window.addEventListener('load', fn)
    } else if (window.attachEvent) {
      window.attachEvent('onload', fn)
    }
  }
}
const pageLoad = new PageLoad()
if (
  window.UUFoxWebJSSDKPlugin &&
  Object.prototype.toString.call(window.UUFoxWebJSSDKPlugin) === '[object Object]'
) {
  window.UUFoxWebJSSDKPlugin.PageLoad = window.UUFoxWebJSSDKPlugin.PageLoad || pageLoad
} else {
  window.UUFoxWebJSSDKPlugin = {
    PageLoad: pageLoad
  }
}

export default pageLoad
