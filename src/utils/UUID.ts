import { getRandom } from '.'
export const UUID = (function () {
  const T = function () {
    const d: number = new Date().getTime()
    let i = 0
    while (d == new Date().getTime()) {
      i++
    }
    return d.toString(16) + i.toString(16)
  }
  const R = function () {
    return getRandom().toString(16).replace('.', '')
  }
  const UA = function () {
    const ua = navigator.userAgent
    let i
    let ch
    let buffer: any = []
    let ret = 0

    function xor(result: any, byte_array: any) {
      let j
      let tmp = 0
      for (j = 0; j < byte_array.length; j++) {
        tmp |= buffer[j] << (j * 8)
      }
      return result ^ tmp
    }

    for (i = 0; i < ua.length; i++) {
      ch = ua.charCodeAt(i)
      buffer.unshift(ch & 0xff)
      if (buffer.length >= 4) {
        ret = xor(ret, buffer)
        buffer = []
      }
    }

    if (buffer.length > 0) {
      ret = xor(ret, buffer)
    }

    return ret.toString(16)
  }

  return function () {
    let se: any = String(screen.height * screen.width)
    if (se && /\d{5,}/.test(se)) {
      se = se.toString(16)
    } else {
      se = String(getRandom() * 31242)
        .replace('.', '')
        .slice(0, 8)
    }
    const val = T() + '-' + R() + '-' + UA() + '-' + se + '-' + T()
    if (val) {
      return val
    } else {
      return (String(getRandom()) + String(getRandom()) + String(getRandom())).slice(2, 15)
    }
  }
})()
