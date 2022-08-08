import { isArray, _localStorage, isObject, isFunction, isNumber } from '../../utils'

export default class Stage {
  processDef: any
  registeredInterceptors: {}
  constructor(processDef: any) {
    if (!isObject(processDef)) {
      throw 'error: Stage constructor requires arguments.'
    }
    this.processDef = processDef
    this.registeredInterceptors = {}
  }

  process(proc: any, data: any) {
    if (!proc || !(proc in this.processDef)) {
      console.warn('process [' + proc + '] is not supported')
      return
    }

    const itcptrs = this.registeredInterceptors[proc]
    if (itcptrs && isArray(itcptrs) && itcptrs.length > 0) {
      const pos = {
        current: 0,
        total: itcptrs.length
      }
      const context = new InterceptorContext(data, pos, {})

      for (let i = 0; i < itcptrs.length; i++) {
        try {
          pos.current = i + 1
          data = itcptrs[i].call(null, data, context) || data
          if (context.cancellationToken.getCanceled()) {
            break
          }
        } catch (e) {
          console.warn('interceptor error:' + e)
        }
      }
    }

    if (this.processDef[proc] && this.processDef[proc] in this.processDef) {
      data = this.process(this.processDef[proc], data)
    }
    return data
  }

  registerStageImplementation(stageImpl: any) {
    if (!stageImpl || !stageImpl.init || !isFunction(stageImpl.init)) {
      return
    }
    stageImpl.init(this)
    stageImpl.interceptor && this.registerInterceptor(stageImpl.interceptor)
  }

  registerInterceptor(interceptor: any) {
    if (!interceptor) {
      return
    }
    for (const i in interceptor) {
      const itcptr = interceptor[i]
      if (!itcptr || !isObject(itcptr) || !isFunction(itcptr.entry)) {
        continue
      }

      if (!isNumber(itcptr.priority)) {
        itcptr.priority = Number.MAX_VALUE
      }

      if (!this.registeredInterceptors[i]) {
        this.registeredInterceptors[i] = []
      }

      const curIts = this.registeredInterceptors[i]
      itcptr.entry.priority = itcptr.priority
      curIts.push(itcptr.entry)

      curIts.sort(function (ita: any, itb: any) {
        return ita.priority - itb.priority
      })
    }
  }
}

class CancellationToken {
  canceled: boolean
  constructor(canceled = false) {
    this.canceled = canceled
  }

  cancel() {
    this.canceled = true
  }

  getCanceled() {
    return this.canceled || false
  }
}
class InterceptorContext {
  sensors: any
  data: any
  pos: any
  cancellationToken: CancellationToken
  constructor(data: any, pos: any, sd: any) {
    this.cancellationToken = new CancellationToken()
    this.sensors = sd
    this.data = data
    this.pos = pos
  }

  getOriginalData() {
    let originalData = null
    try {
      originalData = JSON.parse(JSON.stringify(this.data || null))
    } catch (e) {
      console.warn(e)
    }
    return originalData
  }

  getPosition() {
    return this.pos
  }
}
