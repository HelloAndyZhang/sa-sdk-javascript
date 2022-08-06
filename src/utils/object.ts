import { isArray, isObject, isDate, formatDate } from './index'

const nativeForEach = Array.prototype.forEach
const hasOwnProperty = Object.prototype.hasOwnProperty

export function searchObjDate(o: any) {
  if (isObject(o)) {
    each(o, function (a: any, b: any) {
      if (isObject(a)) {
        searchObjDate(o[b])
      } else {
        if (isDate(a)) {
          o[b] = formatDate(a)
        }
      }
    })
  }
}
export function each(obj: any, iterator: any, context?: any) {
  if (obj == null) {
    return
  }
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context)
  } else if (isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      i in obj && iterator.call(context, obj[i], i, obj)
    }
  } else {
    for (const key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        iterator.call(context, obj[key], key, obj)
      }
    }
  }
}

export function extend(obj: any, ...rest: any[]) {
  each(rest, function (source: any) {
    for (const prop in source) {
      if (hasOwnProperty.call(source, prop) && source[prop] !== undefined) {
        obj[prop] = source[prop]
      }
    }
  })
  return obj
}
export function safeJSONParse(str: any) {
  let val = null
  try {
    val = JSON.parse(str)
  } catch (e) {}
  return val
}
export function coverExtend(obj: any, ...rest: any[]) {
  each(rest, function (source: any) {
    for (const prop in source) {
      if (source[prop] !== undefined && obj[prop] === undefined) {
        obj[prop] = source[prop]
      }
    }
  })
  return obj
}

export function searchConfigData(data: Record<string, any>) {
  if (typeof data === 'object' && data.$option) {
    const data_config = data.$option
    delete data.$option
    return data_config
  } else {
    return {}
  }
}
