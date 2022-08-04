import { isString } from './index'

const flag = 'data:enc;'
const flag_dfm = 'dfm-enc-'
export function rot13obfs(str: string, key: any) {
  str = String(str)
  key = typeof key === 'number' ? key : 13
  const n = 126

  const chars = str.split('')

  for (let i = 0, len = chars.length; i < len; i++) {
    const c = chars[i].charCodeAt(0)

    if (c < n) {
      chars[i] = String.fromCharCode((chars[i].charCodeAt(0) + key) % n)
    }
  }

  return chars.join('')
}

export function rot13defs(str: string) {
  const key = 13
  const n = 126
  str = String(str)

  return rot13obfs(str, n - key)
}
export function dfmapping(str: string) {
  const dfk = 't6KJCZa5pDdQ9khoEM3Tj70fbP2eLSyc4BrsYugARqFIw1mzlGNVXOHiWvxUn8'
  const len = dfk.length - 1
  const relation: any = {}
  let i = 0
  for (i = 0; i < dfk.length; i++) {
    relation[dfk.charAt(i)] = dfk.charAt(len - i)
  }
  let newStr = ''
  for (i = 0; i < str.length; i++) {
    if (str.charAt(i) in relation) {
      newStr += relation[str.charAt(i)]
    } else {
      newStr += str.charAt(i)
    }
  }
  return newStr
}
export function decrypt(v: string) {
  if (v.indexOf(flag) === 0) {
    v = v.substring(flag.length)
    v = rot13defs(v)
  } else if (v.indexOf(flag_dfm) === 0) {
    v = v.substring(flag_dfm.length)
    v = dfmapping(v)
  }
  return v
}

export function decryptIfNeeded(cross: any) {
  if (isString(cross) && (cross.indexOf(flag) === 0 || cross.indexOf(flag_dfm) === 0)) {
    cross = decrypt(cross)
  }
  return cross
}

export function encrypt(v: string) {
  return flag_dfm + dfmapping(v)
}
