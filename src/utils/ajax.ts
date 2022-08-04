import { extend, isObject, each } from './index'
export function xhr(cors: any) {
  if (cors) {
    if (typeof window.XMLHttpRequest !== 'undefined' && 'withCredentials' in new XMLHttpRequest()) {
      return new XMLHttpRequest()
      // @ts-ignore
    } else if (typeof XDomainRequest !== 'undefined') {
      // @ts-ignore
      return new XDomainRequest()
    } else {
      return null
    }
  } else {
    if (typeof window.XMLHttpRequest !== 'undefined') {
      return new XMLHttpRequest()
    }
    // @ts-ignore
    if (window.ActiveXObject) {
      try {
        // @ts-ignore
        return new ActiveXObject('Msxml2.XMLHTTP')
      } catch (d) {
        try {
          // @ts-ignore
          return new ActiveXObject('Microsoft.XMLHTTP')
        } catch (d) {
          console.log(d)
        }
      }
    }
  }
}

export function ajax(para: any) {
  para.timeout = para.timeout || 20000

  para.credentials = typeof para.credentials === 'undefined' ? true : para.credentials

  function getJSON(data: any) {
    if (!data) {
      return ''
    }
    try {
      return JSON.parse(data)
    } catch (e) {
      return {}
    }
  }

  const g = xhr(para.cors)

  if (!g) {
    return
  }

  if (!para.type) {
    para.type = para.data ? 'POST' : 'GET'
  }
  para = extend(
    {
      success: function () {},
      error: function () {}
    },
    para
  )

  const oldsuccess = para.success
  const olderror = para.error
  let errorTimer: any

  function abort() {
    try {
      if (g && typeof g === 'object' && g.abort) {
        g.abort()
      }
    } catch (error) {
      console.log(error)
    }

    if (errorTimer) {
      clearTimeout(errorTimer)
      errorTimer = null
      para.error && para.error()
      g.onreadystatechange = null
      g.onload = null
      g.onerror = null
    }
  }

  para.success = function (data: any) {
    oldsuccess(data)
    if (errorTimer) {
      clearTimeout(errorTimer)
      errorTimer = null
    }
  }
  para.error = function (err: any) {
    olderror(err)
    if (errorTimer) {
      clearTimeout(errorTimer)
      errorTimer = null
    }
  }
  errorTimer = setTimeout(function () {
    abort()
  }, para.timeout)
  // @ts-ignore
  if (typeof XDomainRequest !== 'undefined' && g instanceof XDomainRequest) {
    g.onload = function () {
      para.success && para.success(getJSON(g.responseText))
      g.onreadystatechange = null
      g.onload = null
      g.onerror = null
    }
    g.onerror = function () {
      para.error && para.error(getJSON(g.responseText), g.status)
      g.onreadystatechange = null
      g.onerror = null
      g.onload = null
    }
  }
  g.onreadystatechange = function () {
    try {
      if (g.readyState == 4) {
        if ((g.status >= 200 && g.status < 300) || g.status == 304) {
          para.success(getJSON(g.responseText))
        } else {
          para.error(getJSON(g.responseText), g.status)
        }
        g.onreadystatechange = null
        g.onload = null
      }
    } catch (e) {
      g.onreadystatechange = null
      g.onload = null
    }
  }

  g.open(para.type, para.url, true)

  try {
    if (para.credentials) {
      g.withCredentials = true
    }
    if (isObject(para.header)) {
      each(para.header, function (v: any, i: any) {
        g.setRequestHeader && g.setRequestHeader(i, v)
      })
    }

    if (para.data) {
      if (!para.cors) {
        g.setRequestHeader && g.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
      }
      if (para.contentType === 'application/json') {
        g.setRequestHeader && g.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
      } else {
        g.setRequestHeader &&
          g.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      }
    }
  } catch (e) {
    console.log(e)
  }

  g.send(para.data || null)
}
