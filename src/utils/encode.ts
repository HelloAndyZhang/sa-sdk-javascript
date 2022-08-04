export const encodeTrackData = (data: string) => {
  const dataStr = base64Encode(data)
  const crc = 'crc=' + hashCode(dataStr)
  return 'data=' + encodeURIComponent(dataStr) + '&ext=' + encodeURIComponent(crc)
}

export function base64Decode(str: string) {
  let arr: any = []
  try {
    arr = atob(str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
  } catch (e) {
    arr = []
  }

  try {
    return decodeURIComponent(arr.join(''))
  } catch (e) {
    return arr.join('')
  }
}

export function base64Encode(str: string) {
  let result = ''
  try {
    result = btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1: string) =>
        String.fromCharCode(parseInt('0x' + p1, 16))
      )
    )
  } catch (e) {
    result = str
  }
  return result
}

export function hashCode(str: string) {
  if (typeof str !== 'string') {
    return 0
  }
  let hash = 0
  let char = null
  if (str.length == 0) {
    return hash
  }
  for (let i = 0; i < str.length; i++) {
    char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}

export function hashCode53(str: string) {
  const max53 = 9007199254740992
  const min53 = -9007199254740992
  const factor = 31
  let hash = 0
  if (str.length > 0) {
    const val = str.split('')
    for (let i = 0; i < val.length; i++) {
      // @ts-ignore
      const aVal = val[i].charCodeAt()
      let nextHash = factor * hash + aVal
      if (nextHash > max53) {
        hash = min53 + hash
        while (((nextHash = factor * hash + aVal), nextHash < min53)) {
          hash = hash / 2 + aVal
        }
      }
      if (nextHash < min53) {
        hash = max53 + hash
        while (((nextHash = factor * hash + aVal), nextHash > max53)) {
          hash = hash / 2 + aVal
        }
      }
      hash = factor * hash + aVal
    }
  }
  return hash
}
export function _decodeURIComponent(uri: string) {
  let result = uri
  try {
    result = decodeURIComponent(uri)
  } catch (e) {
    result = uri
  }
  return result
}
