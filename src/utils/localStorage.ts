import Logger from '../helper/Logger'
const logger = new Logger({ id: 'localStorage', enabled: true })
export const _localStorage = {
  get: function (key: string) {
    return window.localStorage.getItem(key)
  },
  parse: function (key: string) {
    let storedValue
    try {
      storedValue = JSON.parse(_localStorage.get(key) as string) || null
    } catch (err) {
      logger.info(err)
    }
    return storedValue
  },
  set: function (key: string, value: string) {
    try {
      window.localStorage.setItem(key, value)
    } catch (err) {
      logger.info(err)
    }
  },
  remove: function (key: string) {
    window.localStorage.removeItem(key)
  },
  isSupport: function () {
    let supported = true
    try {
      const supportName = '__local_store_support__'
      const val = 'testIsSupportStorage'
      _localStorage.set(supportName, val)
      if (_localStorage.get(supportName) !== val) {
        supported = false
      }
      _localStorage.remove(supportName)
    } catch (err) {
      logger.log(err)
      supported = false
    }
    return supported
  }
}
