import { isFunction } from './index'

export function now() {
  if (Date.now && isFunction(Date.now)) {
    return Date.now()
  }
  return new Date().getTime()
}
