// import { Toast } from '@FunUI/Fun-UI'
import { getStorage, getCookie } from '@uupt/utils'
import { extend, type RequestMethod } from '@uupt/request'

/**
 * @method 公共头部
 */
const commonHeader = () => {
  return {
    // h5唯一设备码
    ClientUuid: getStorage('CLIENTUUID') || getCookie('CLIENTUUID') || ''
  }
}

const Request: RequestMethod = extend({
  // prefix: ''
  timeout: 10000,
  headers: {
    // 看服务端要求 自行修改
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
Request.interceptors.request.use((url, options) => {
  Object.assign(options.headers, commonHeader())
  const { isLoad = true } = options
  if (isLoad) {
    // Toast.loading({
    //   forbidClick: true,
    //   duration: 0
    // })
  }
  return { url, options }
})

// 响应拦截器
Request.interceptors.response.use(response => {
  // Toast.clear()
  return response
})

/**
 * @method Get请求
 * @param url 接口地址
 * @param data 参数
 * @param options 配置
 */
const Get = (url = '', data = {}, options = {}) => {
  const _options = Object.assign(options, { method: 'get', params: data })
  return Request(url, _options)
}

/**
 * @method Post请求
 * @param url  接口地址
 * @param data 参数
 * @param options 配置
 */
const Post = (url = '', data = {}, options = {}) => {
  const _options = Object.assign(options, { method: 'post', data })
  return Request(url, _options)
}

export { Request, Get, Post }
