import { _localStorage, safeJSONParse, getRandom, now } from '../utils'
export default class ConcurrentStorage {
  lockGetPrefix: string
  lockSetPrefix: string
  constructor(lockGetPrefix = 'lock-get-prefix', lockSetPrefix = 'lock-set-prefix') {
    this.lockGetPrefix = lockGetPrefix
    this.lockSetPrefix = lockSetPrefix
  }

  get(key: string, lockTimeout: number, checkTime: number, callback: (params: any) => void) {
    if (!key) throw new Error('key is must')
    lockTimeout = lockTimeout || 10000
    checkTime = checkTime || 1000
    callback = callback || function () {}
    const lockKey = this.lockGetPrefix + key
    let lock: any = _localStorage.get(lockKey)
    const randomNum = String(getRandom())
    if (lock) {
      lock = safeJSONParse(lock) || {
        randomNum: 0,
        expireTime: 0
      }
      if (lock.expireTime > now()) {
        return callback(null)
      }
    }
    _localStorage.set(
      lockKey,
      JSON.stringify({
        randomNum: randomNum,
        expireTime: now() + lockTimeout
      })
    )
    setTimeout(function () {
      lock = safeJSONParse(_localStorage.get(lockKey)) || {
        randomNum: 0,
        expireTime: 0
      }
      if (lock && lock.randomNum === randomNum) {
        callback(_localStorage.get(key))
        _localStorage.remove(key)
        _localStorage.remove(lockKey)
      } else {
        callback(null)
      }
    }, checkTime)
  }

  set(
    key: string,
    val: any,
    lockTimeout: number,
    checkTime: number,
    callback: (params: { status: string; reason?: string }) => void = () => {}
  ) {
    if (!key || !val) throw new Error('key and val is must')
    lockTimeout = lockTimeout || 10000
    checkTime = checkTime || 1000
    const lockKey = this.lockSetPrefix + key
    let lock: any = _localStorage.get(lockKey)
    const randomNum = String(getRandom())
    if (lock) {
      lock = safeJSONParse(lock) || {
        randomNum: 0,
        expireTime: 0
      }
      if (lock.expireTime > now()) {
        return callback({
          status: 'fail',
          reason: 'This key is locked'
        })
      }
    }
    _localStorage.set(
      lockKey,
      JSON.stringify({
        randomNum: randomNum,
        expireTime: now() + lockTimeout
      })
    )
    setTimeout(function () {
      lock = safeJSONParse(_localStorage.get(lockKey)) || {
        randomNum: 0,
        expireTime: 0
      }
      if (lock.randomNum === randomNum) {
        _localStorage.set(key, val)
        callback &&
          callback({
            status: 'success'
          })
      } else {
        callback({
          status: 'fail',
          reason: 'This key is locked'
        })
      }
    }, checkTime)
  }
}
