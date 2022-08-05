import { sdPara } from '../Constant'
const memory = {
  data: {},

  get(name: string) {
    const value = this.data[name]
    if (value === undefined) return null
    if (value._expirationTimestamp_ !== undefined) {
      if (new Date().getTime() > value._expirationTimestamp_) {
        return null
      }
      return value.value
    }
    return value
  },

  set(name: string, value: any, days: any) {
    if (days) {
      const date = new Date()
      let expirationTimestamp
      if (String(days).slice(-1) === 's') {
        expirationTimestamp = date.getTime() + Number(String(days).slice(0, -1)) * 1000
      } else {
        expirationTimestamp = date.getTime() + days * 24 * 60 * 60 * 1000
      }
      value = {
        value: value,
        _expirationTimestamp_: expirationTimestamp
      }
    }
    this.data[name] = value
  },

  getNewUserFlagMemoryKey(name_prefix: string) {
    return 'ufoxjssdk_2015_' + sdPara.sdk_id + name_prefix
  }
}
export default memory
