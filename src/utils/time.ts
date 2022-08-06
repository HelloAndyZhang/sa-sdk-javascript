import { isFunction } from './index'

export function now() {
  if (Date.now && isFunction(Date.now)) {
    return Date.now()
  }
  return new Date().getTime()
}

export function formatDate(date: any) {
  function pad(n: any) {
    return n < 10 ? '0' + n : n
  }
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    '.' +
    pad(date.getMilliseconds())
  )
}
