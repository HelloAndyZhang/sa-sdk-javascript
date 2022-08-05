import {
  isString,
  isArray,
  _localStorage,
  safeJSONParse,
  getRandom,
  base64Encode,
  ajax,
  now
} from '../utils'
import ConcurrentStorage from '../helper/ConcurrentStorage'
import ufox from '..'
const dataStoragePrefix = 'ufoxwebjssdk-'
const tabStoragePrefix = 'tab-ufoxwebjssdk-'

/**
 *    批量发送数据
 */
export default class BatchSend {
  sendTimeStamp: number
  timer: any
  serverUrl: string
  hasTabStorage: boolean
  tabKey: string
  constructor() {
    this.sendTimeStamp = 0
    this.timer = null
    this.serverUrl = ''
    this.hasTabStorage = false
    this.tabKey = ''
  }

  batchInterval() {
    if (this.serverUrl === '') this.getServerUrl()
    if (!this.hasTabStorage) {
      this.generateTabStorage()
      this.hasTabStorage = true
    }
    const self = this
    self.timer = setTimeout(function () {
      self.updateExpireTime()
      self.recycle()
      self.send()
      clearTimeout(self.timer)
      self.batchInterval()
    }, ufox.para.batch_send.send_interval)
  }

  getServerUrl() {
    if (
      (isString(ufox.para.server_url) && ufox.para.server_url !== '') ||
      (isArray(ufox.para.server_url) && ufox.para.server_url.length)
    ) {
      this.serverUrl = isArray(ufox.para.server_url)
        ? ufox.para.server_url[0]
        : ufox.para.server_url
    } else {
      return ufox.logger.log(
        '当前 server_url 为空或不正确，只在控制台打印日志，network 中不会发数据，请配置正确的 server_url！'
      )
    }
  }

  send() {
    if (this.sendTimeStamp && now() - this.sendTimeStamp < ufox.para.batch_send.datasend_timeout)
      return
    let tabStorage: any = _localStorage.get(this.tabKey)
    if (tabStorage) {
      this.sendTimeStamp = now()
      tabStorage = safeJSONParse(tabStorage) || this.generateTabStorageVal()
      if (tabStorage.data.length) {
        const data = []
        for (let i = 0; i < tabStorage.data.length; i++) {
          data.push(ufox.store.readObjectVal(tabStorage.data[i]))
        }
        this.request(data, tabStorage.data)
      }
    }
  }

  updateExpireTime() {
    let tabStorage: any = _localStorage.get(this.tabKey)
    if (tabStorage) {
      tabStorage = safeJSONParse(tabStorage) || this.generateTabStorageVal()
      tabStorage.expireTime = now() + ufox.para.batch_send.send_interval * 2
      tabStorage.serverUrl = this.serverUrl
      _localStorage.set(this.tabKey, JSON.stringify(tabStorage))
    }
  }

  request(data: any, dataKeys: any) {
    const self = this
    ajax({
      url: this.serverUrl,
      type: 'POST',
      data: 'data_list=' + encodeURIComponent(base64Encode(JSON.stringify(data))),
      credentials: false,
      timeout: ufox.para.batch_send.datasend_timeout,
      cors: true,
      success: function () {
        self.remove(dataKeys)
        self.sendTimeStamp = 0
      },
      error: function () {
        self.sendTimeStamp = 0
      }
    })
  }

  remove(dataKeys: any) {
    const tabStorage = _localStorage.get(this.tabKey)
    if (tabStorage) {
      const tabStorageData = (safeJSONParse(tabStorage) || this.generateTabStorageVal()).data
      for (let i = 0; i < dataKeys.length; i++) {
        const idx = tabStorageData.indexOf(dataKeys[i])
        if (idx > -1) {
          tabStorageData.splice(idx, 1)
        }
        _localStorage.remove(dataKeys[i])
      }
      _localStorage.set(this.tabKey, JSON.stringify(this.generateTabStorageVal(tabStorageData)))
    }
  }

  add(data: any) {
    const dataKey = dataStoragePrefix + String(getRandom())
    let tabStorage: any = _localStorage.get(this.tabKey)
    if (tabStorage === null) {
      this.tabKey = tabStoragePrefix + String(getRandom())
      tabStorage = this.generateTabStorageVal()
    } else {
      tabStorage = safeJSONParse(tabStorage) || this.generateTabStorageVal()
    }
    tabStorage.data.push(dataKey)
    tabStorage.expireTime = now() + ufox.para.batch_send.send_interval * 2
    _localStorage.set(this.tabKey, JSON.stringify(tabStorage))
    ufox.store.saveObjectVal(dataKey, data)
    if (data.type === 'track_signup' || data.event === '$pageview') {
      this.sendImmediately()
    }
  }

  generateTabStorage() {
    this.tabKey = tabStoragePrefix + String(getRandom())
    _localStorage.set(this.tabKey, JSON.stringify(this.generateTabStorageVal()))
  }

  generateTabStorageVal(data?: any) {
    data = data || []
    return {
      data: data,
      expireTime: now() + ufox.para.batch_send.send_interval * 2,
      serverUrl: this.serverUrl
    }
  }

  sendImmediately() {
    this.send()
  }

  recycle() {
    const notSendMap: any = {}
    const lockTimeout = 10000
    const lockPrefix = 'ufoxjssdk-lock-get-'
    for (let i = 0; i < localStorage.length; i++) {
      const item: any = localStorage.key(i)
      var self = this
      if (item.indexOf(tabStoragePrefix) === 0) {
        const tabStorage = safeJSONParse(_localStorage.get(item)) || this.generateTabStorageVal()
        for (let j = 0; j < tabStorage.data.length; j++) {
          notSendMap[tabStorage.data[j]] = true
        }
        if (now() > tabStorage.expireTime && this.serverUrl === tabStorage.serverUrl) {
          const concurrentStorage = new ConcurrentStorage(lockPrefix)
          concurrentStorage.get(item, lockTimeout, 1000, function (data: any) {
            if (data) {
              if (_localStorage.get(self.tabKey) === null) {
                self.generateTabStorage()
              }
              const recycleData = safeJSONParse(data) || self.generateTabStorageVal()
              _localStorage.set(
                self.tabKey,
                JSON.stringify(
                  self.generateTabStorageVal(
                    (
                      safeJSONParse(_localStorage.get(self.tabKey)) || self.generateTabStorageVal()
                    ).data.concat(recycleData.data)
                  )
                )
              )
            }
          })
        }
      } else if (item.indexOf(lockPrefix) === 0) {
        const lock = safeJSONParse(_localStorage.get(item)) || {
          expireTime: 0
        }
        if (now() - lock.expireTime > lockTimeout) {
          _localStorage.remove(item)
        }
      }
    }
    for (let n = 0; n < localStorage.length; n++) {
      const key1: any = localStorage.key(n)
      if (key1.indexOf(dataStoragePrefix) === 0 && !notSendMap[key1]) {
        _localStorage.remove(key1)
      }
    }
  }
}
