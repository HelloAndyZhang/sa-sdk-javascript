// function Stage (processDef) {
//   if (!isObject(processDef)) {
//     throw 'error: Stage constructor requires arguments.'
//   }
//   this.processDef = processDef
//   this.registeredInterceptors = {}
// }

// Stage.prototype.process = function (proc, data) {
//   if (!proc || !(proc in this.processDef)) {
//     sdLog('process [' + proc + '] is not supported')
//     return
//   }

//   const itcptrs = this.registeredInterceptors[proc]
//   if (itcptrs && isArray(itcptrs) && itcptrs.length > 0) {
//     const pos = {
//       current: 0,
//       total: itcptrs.length
//     }
//     const context = new InterceptorContext(data, pos, sd)

//     for (let i = 0; i < itcptrs.length; i++) {
//       try {
//         pos.current = i + 1
//         data = itcptrs[i].call(null, data, context) || data
//         if (context.cancellationToken.getCanceled()) {
//           break
//         }
//       } catch (e) {
//         sdLog('interceptor error:' + e)
//       }
//     }
//   }

//   if (this.processDef[proc] && this.processDef[proc] in this.processDef) {
//     data = this.process(this.processDef[proc], data)
//   }
//   return data
// }

// Stage.prototype.registerStageImplementation = function (stageImpl) {
//   if (!stageImpl || !stageImpl.init || !isFunction(stageImpl.init)) {
//     return
//   }
//   stageImpl.init(this)
//   stageImpl.interceptor && this.registerInterceptor(stageImpl.interceptor)
// }

// Stage.prototype.registerInterceptor = function (interceptor) {
//   if (!interceptor) {
//     return
//   }
//   for (const i in interceptor) {
//     const itcptr = interceptor[i]
//     if (!itcptr || !isObject(itcptr) || !isFunction(itcptr.entry)) {
//       continue
//     }

//     if (!isNumber(itcptr.priority)) {
//       itcptr.priority = Number.MAX_VALUE
//     }

//     if (!this.registeredInterceptors[i]) {
//       this.registeredInterceptors[i] = []
//     }

//     const curIts = this.registeredInterceptors[i]
//     itcptr.entry.priority = itcptr.priority
//     curIts.push(itcptr.entry)

//     curIts.sort(function (ita, itb) {
//       return ita.priority - itb.priority
//     })
//   }
// }
