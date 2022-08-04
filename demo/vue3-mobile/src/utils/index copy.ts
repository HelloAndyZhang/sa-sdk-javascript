/**
 * 存取session
 * @param {string} key 键
 * @param {*} val 值
 */
export const session = function (key: string, val?: any): any {
  if (typeof key !== 'string') throw new Error('key must be a string!')
  if (val === undefined) {
    try {
      return JSON.parse(sessionStorage.getItem(key))
    } catch (err) {
      return sessionStorage.getItem(key)
    }
  } else {
    val = typeof val === 'string' ? val : JSON.stringify(val)
    sessionStorage.setItem(key, val)
  }
}

/**
 * 清除session
 * @param {string} key 键
 */
export const removeSession = function (key: string): any {
  if (!key) {
    sessionStorage.clear()
    return
  }
  if (typeof key !== 'string') throw new Error('key must be a string!')
  sessionStorage.getItem(key) && sessionStorage.removeItem(key)
}
/**
 * @method 读、存localStorage
 * @param {*} key 键
 * @param {*} val 值
 */
export const local = function (key: string, val?: any): any {
  if (typeof key !== 'string') throw new Error('key must be a string!')
  if (val === undefined) {
    try {
      return JSON.parse(localStorage.getItem(key))
    } catch (err) {
      return localStorage.getItem(key)
    }
  } else {
    val = typeof val === 'string' ? val : JSON.stringify(val)
    localStorage.setItem(key, val)
  }
}
/**
 * @method 删除localStorage
 * @param {*} key 键
 */
export const removeLocal = function (key: string): void {
  if (!key) {
    localStorage.clear()
    return
  }
  if (typeof key !== 'string') throw new Error('key must be a string!')
  localStorage.getItem(key) && localStorage.removeItem(key)
}

/**
 * @method 禁止ios双击上移
 */
export const ProMove = function (): void {
  try {
    const agent = navigator.userAgent.toLowerCase() // 检测是否是ios
    let iLastTouch = null // 缓存上一次tap的时间
    if (agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0) {
      document.body.addEventListener(
        'touchend',
        function (event) {
          const iNow = new Date().getTime()
          iLastTouch = iLastTouch || iNow + 1 /** 第一次时将iLastTouch设为当前时间+1 */
          const delta = iNow - iLastTouch
          if (delta < 500 && delta > 0) {
            event.preventDefault()
            return false
          }
          iLastTouch = iNow
        },
        false
      )
    }
  } catch (e) {
    console.info(e)
  }
}

/**
 * @method 创建cookie
 * @param {Sting} a cookie对应的键
 * @param {Value} b cookie对应的值
 * @param {Number} c 存储的天数
 * @param {String} d 存储的路径
 */
export const CreateCookie = function (a: string, b: any, c?: number, d = '/'): void {
  let f = ''
  if (c) {
    const e = new Date()
    e.setTime(e.getTime() + 1e3 * 60 * 60 * 24 * c)
    // @ts-ignore
    f = '; expires=' + e.toGMTString()
  } else {
    f = ''
  }
  document.cookie = a + '=' + b + f + '; path=' + d
}

/**
 * @method 读取cookie
 * @param {Sting} a cookie的名称
 */
export const ReadCookie = function (a: string) {
  for (let b = a + '=', c = document.cookie.split(';'), d = 0; d < c.length; d++) {
    // eslint-disable-next-line
    for (var e = c[d]; ' ' == e.charAt(0); ) e = e.substring(1, e.length)
    if (e.indexOf(b) == 0) return e.substring(b.length, e.length)
  }
  return null
}

/**
 * @method 删除cookie
 * @param {String} name cookie的名称
 */
export const DelCookie = function (name: string): void {
  const exp = new Date()
  exp.setTime(exp.getTime() - 1)
  const cval = this.ReadCookie(name)
  // @ts-ignore
  if (cval != null) document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString()
}

/**
 * @method 过滤手机号空格以及+86
 * @param {Number} tel 手机号
 */
export const filterPhone = function (tel: string): string {
  const phone = String(tel)
    .replace(/[^\d.]+/g, '')
    .replace(/^\+?86/g, '')
    .substring(0, 11)
  return phone
}

/**
 * @method 获取当前数据类型
 * @param {*} obj
 */
export const getType = function (obj: any): string {
  const toString = Object.prototype.toString
  const map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  }
  if (obj instanceof Element) {
    return 'element'
  }
  return map[toString.call(obj)]
}
/**
 * @method 对象深克隆
 * @param {Object} data 源对象
 * @returns {Object}} 拷贝后的对象
 */

export const deepClone = function (data: any) {
  const type = this.getType(data)
  let obj
  if (type === 'array') {
    obj = []
  } else if (type === 'object') {
    obj = {}
  } else {
    // 不再具有下一层次
    return data
  }
  if (type === 'array') {
    for (let i = 0, len = data.length; i < len; i++) {
      obj.push(this.deepClone(data[i]))
    }
  } else if (type === 'object') {
    for (const key in data) {
      obj[key] = this.deepClone(data[key])
    }
  }
  return obj
}

/**
 * @method 移除数组中指定的项
 * @param {Array} arr 传入的原数组
 * @param {Function} func 传入的过滤条件
 * @returns {Array} 被移除的项组成的数组
 */
export const removeArr = (arr: Array<any>, func: any): Array<any> => {
  if (Array.isArray(arr)) {
    return arr.filter(func).reduce((newArr, val) => {
      arr.splice(arr.indexOf(val), 1)
      return newArr.concat(val)
    }, [])
  } else {
    return []
  }
}

/**
 * @method 处理输入框获取焦点安卓机型布局上移问题
 */
export const dealWithInput = (): void => {
  if (/Android [4-8]/.test(navigator.appVersion)) {
    window.addEventListener('resize', function () {
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA'
      ) {
        window.setTimeout(function () {
          ;(<any>document.activeElement).scrollIntoViewIfNeeded()
        }, 0)
      }
    })
  }
}

/**
 * @method 当前元素是否包含特定class
 * @param {Object} el 目标元素
 * @param {String} className 类名
 */
export const hasClass = function (el: HTMLElement, className: string): boolean {
  const reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

/**
 * @method 给当前元素添加class
 * @param {Object} el 目标元素
 * @param {String} className 类名
 */
export const addClass = function (el: HTMLElement, className: string): void {
  if (this.hasClass(el, className)) {
    return
  }
  const newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}
/**
 * @method  移除class
 * @param {Object} el 目标元素
 * @param {String} className 类名
 */
export const removeClass = function (el: HTMLElement, className: string): void {
  if (!this.hasClass(el, className)) {
    return
  }

  const reg = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g')
  el.className = el.className.replace(reg, ' ')
}

/**
 * @method 获取元素扩展属性值
 * @param {Object} el 目标元素
 * @param {String} name 扩展属性名
 * @param {String} val 要设置的扩展属性值
 */
export const getData = function (el: HTMLElement, name: string, val: string): any {
  const prefix = 'data-'
  if (val) {
    return el.setAttribute(prefix + name, val)
  }
  return el.getAttribute(prefix + name)
}

/**
 * @method 获取当前元素信息
 * @param {*} el 目标元素
 */

export type RectRaw = { top: number; left: number; width: number; height: number }
export const getRect = function (el: HTMLElement): RectRaw {
  if (el instanceof window.SVGElement) {
    const rect = el.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  } else {
    return {
      top: el.offsetTop,
      left: el.offsetLeft,
      width: el.offsetWidth,
      height: el.offsetHeight
    }
  }
}

/**
 * @method Android客户端window.replace无效
 * @param {String} url 跳转链接  跳转链接必须同一域名
 */
export const HrefReplace = (url: string): void => {
  if (window.history && history.replaceState) {
    window.history.replaceState(null, '', url)
    history.go(0)
  } else {
    location.replace(url)
  }
}

/**
 * @method 注入调试插件
 */
export const injectEruda = (): void => {
  const script = document.createElement('script')
  script.src = '//uufefile.uupt.com/CDN/js/tools/eruda@2.4.1.min.js'
  script.onload = () => {
    // @ts-ignore
    window?.eruda && window?.eruda.init()
  }
  document.body.appendChild(script)
}
