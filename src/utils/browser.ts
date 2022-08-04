import { trim, _decodeURI } from './index'
export const getUA = () => {
  const Sys: Record<string, number> = {}
  const ua = navigator.userAgent.toLowerCase()
  let s
  if ((s = ua.match(/ qq\/([\d.]+)/))) {
    Sys.qqBuildinBrowser = Number(s[1].split('.')[0])
  } else if ((s = ua.match(/mqqbrowser\/([\d.]+)/))) {
    Sys.qqBrowser = Number(s[1].split('.')[0])
  } else if ((s = ua.match(/opera.([\d.]+)/))) {
    Sys.opera = Number(s[1].split('.')[0])
  } else if ((s = ua.match(/msie ([\d.]+)/))) {
    Sys.ie = Number(s[1].split('.')[0])
  } else if ((s = ua.match(/edge.([\d.]+)/))) {
    Sys.edge = Number(s[1].split('.')[0])
  } else if ((s = ua.match(/firefox\/([\d.]+)/))) {
    Sys.firefox = Number(s[1].split('.')[0])
  } else if ((s = ua.match(/chrome\/([\d.]+)/))) {
    Sys.chrome = Number(s[1].split('.')[0])
  } else if ((s = ua.match(/version\/([\d.]+).*safari/))) {
    Sys.safari = Number(s[1].match(/^\d*.\d*/))
  } else if ((s = ua.match(/trident\/([\d.]+)/))) {
    Sys.ie = 11
  }
  return Sys
}

export function getReferrer(referrer?: any, full?: any) {
  referrer = referrer || document.referrer
  if (typeof referrer !== 'string') {
    return '取值异常_referrer异常_' + String(referrer)
  }
  referrer = trim(referrer)
  referrer = _decodeURI(referrer)
  if (referrer.indexOf('https://www.baidu.com/') === 0 && !full) {
    referrer = referrer.split('?')[0]
  }
  // referrer = referrer.slice(0, sdPara.max_referrer_string_length);
  return typeof referrer === 'string' ? referrer : ''
}
