import {
  cookie,
  decryptIfNeeded,
  safeJSONParse,
  extend,
  coverExtend,
  isArray,
  isObject,
  isString,
  encrypt,
  base64Encode,
  _URL,
  _localStorage,
  isJSONString,
  UUID,
  rot13defs,
  base64Decode,
  isEmptyObject
} from '../utils'
import ufox from '..'
import { IDENTITY_KEY } from '../Constant'
import userInfo from './UserInfo'
interface State {
  history_login_id: any
  distinct_id: string
  first_id: string
  props: any
  identities: any
  _distinct_id: string
  _first_id: string
  [key: string]: any
}

export default class Store {
  requests: never[]
  private _sessionState: {}
  public _state: Partial<State>
  constructor() {
    this.requests = []
    this._sessionState = {}
    this._state = {
      distinct_id: '',
      first_id: '',
      props: {},
      identities: {},
      _distinct_id: '',
      _first_id: ''
    }
  }

  getProps() {
    return this._state.props || {}
  }

  getSessionProps() {
    return this._sessionState
  }

  getOriginDistinctId() {
    return this._state._distinct_id || this._state.distinct_id
  }

  getOriginUnionId(state: any) {
    const obj: any = {}
    state = state || this._state
    const firstId = state._first_id || state.first_id
    const distinct_id = state._distinct_id || state.distinct_id
    if (firstId && distinct_id) {
      obj.login_id = distinct_id
      obj.anonymous_id = firstId
    } else {
      obj.anonymous_id = distinct_id
    }
    return obj
  }

  getDistinctId() {
    const unionId = this.getUnionId()
    return unionId.login_id || unionId.anonymous_id
  }

  getUnionId(state?: any) {
    const obj = this.getOriginUnionId(state)
    if (
      obj.login_id &&
      this._state.history_login_id &&
      this._state.history_login_id.name &&
      this._state.history_login_id.name !== IDENTITY_KEY.LOGIN
    ) {
      obj.login_id = this._state.history_login_id.name + '+' + obj.login_id
    }
    return obj
  }

  getFirstId() {
    return this._state._first_id || this._state.first_id
  }

  initSessionState() {
    let ds = cookie.get('ufoxsession')
    ds = decryptIfNeeded(ds)
    let state = null
    if (ds !== null && typeof (state = safeJSONParse(ds)) === 'object') {
      this._sessionState = state || {}
    }
  }

  setOnce(a: string, b: any) {
    if (!(a in this._state)) {
      this.set(a, b)
    }
  }

  set(name: any, value: any) {
    this._state = this._state || {}
    const pre_id = this._state.distinct_id
    this._state[name] = value
    if (name === 'first_id') {
      delete this._state._first_id
    } else if (name === 'distinct_id') {
      delete this._state._distinct_id
    }
    this.save()
    if (name === 'distinct_id' && pre_id) {
      ufox.events.tempAdd('changeDistinctId', value)
    }
  }

  change(name: any, value: any) {
    this._state['_' + name] = value
  }

  setSessionProps(newp: any) {
    const props = this._sessionState
    extend(props, newp)
    this.sessionSave(props)
  }

  setSessionPropsOnce(newp: any) {
    const props = this._sessionState
    coverExtend(props, newp)
    this.sessionSave(props)
  }

  setProps(newp: any, isCover?: boolean) {
    let props: any = {}
    if (!isCover) {
      props = extend(this._state.props || {}, newp)
    } else {
      props = newp
    }
    for (const key in props) {
      if (typeof props[key] === 'string') {
        props[key] = props[key].slice(0, ufox.para.max_referrer_string_length)
      }
    }
    this.set('props', props)
  }

  setPropsOnce(newp: any) {
    const props = this._state.props || {}
    coverExtend(props, newp)
    this.set('props', props)
  }

  clearAllProps(arr: any) {
    this._sessionState = {}
    let i
    if (isArray(arr) && arr.length > 0) {
      for (i = 0; i < arr.length; i++) {
        if (
          isString(arr[i]) &&
          arr[i].indexOf('latest_') === -1 &&
          isObject(this._state.props) &&
          arr[i] in this._state.props
        ) {
          delete this._state.props[arr[i]]
        }
      }
    } else {
      if (isObject(this._state.props)) {
        for (i in this._state.props) {
          if (i.indexOf('latest_') !== 1) {
            delete this._state.props[i]
          }
        }
      }
    }
    this.sessionSave({})
    this.save()
  }

  sessionSave(props: any) {
    this._sessionState = props
    let sessionStateStr = JSON.stringify(this._sessionState)
    if (ufox.para.encrypt_cookie) {
      sessionStateStr = encrypt(sessionStateStr)
    }
    cookie.set('ufoxsession', sessionStateStr, 0)
  }

  save() {
    const copyState = JSON.parse(JSON.stringify(this._state))
    delete copyState._first_id
    delete copyState._distinct_id

    if (copyState.identities) {
      copyState.identities = base64Encode(JSON.stringify(copyState.identities))
    }

    let stateStr = JSON.stringify(copyState)
    if (ufox.para.encrypt_cookie) {
      stateStr = encrypt(stateStr)
    }
    cookie.set(this.getCookieName(), stateStr, 73000, ufox.para.cross_subdomain)
  }

  getCookieName() {
    let sub = ''
    if (ufox.para.cross_subdomain === false) {
      try {
        sub = _URL(location.href).hostname
      } catch (e) {
        console.log(e)
      }
      if (typeof sub === 'string' && sub !== '') {
        sub = 'sa_jssdk_2015_' + ufox.para.sdk_id + sub.replace(/\./g, '_')
      } else {
        sub = 'sa_jssdk_2015_root' + ufox.para.sdk_id
      }
    } else {
      sub = 'ufoxjssdkcross' + ufox.para.sdk_id
    }
    return sub
  }

  init() {
    const compatibleWith3 = (state: any) => {
      let identitiesprop
      if (state.identities) {
        if (state.identities.indexOf('\n/') === 0) {
          state.identities = safeJSONParse(rot13defs(state.identities))
        } else {
          state.identities = safeJSONParse(base64Decode(state.identities))
        }
      }
      const unionId = this.getOriginUnionId(state)

      if (state.identities && isObject(state.identities) && !isEmptyObject(state.identities)) {
        if (
          state.identities.$identity_anonymous_id &&
          state.identities.$identity_anonymous_id !== unionId.anonymous_id
        ) {
          state.identities.$identity_anonymous_id = unionId.anonymous_id
        }
      } else {
        state.identities = {}
        state.identities.$identity_anonymous_id = unionId.anonymous_id
        state.identities.$identity_cookie_id = UUID()
      }

      state.history_login_id = state.history_login_id || {}
      const history_login_id = state.history_login_id
      const old_login_id_name = history_login_id.name

      if (unionId.login_id) {
        if (old_login_id_name && state.identities.hasOwnProperty(old_login_id_name)) {
          if (state.identities[old_login_id_name] !== unionId.login_id) {
            state.identities[old_login_id_name] = unionId.login_id
            for (identitiesprop in state.identities) {
              if (state.identities.hasOwnProperty(identitiesprop)) {
                if (
                  identitiesprop !== '$identity_cookie_id' &&
                  identitiesprop !== old_login_id_name
                ) {
                  delete state.identities[identitiesprop]
                }
              }
            }
            state.history_login_id.value = unionId.login_id
          }
        } else {
          const currentLoginKey = old_login_id_name || IDENTITY_KEY.LOGIN
          state.identities[currentLoginKey] = unionId.login_id
          for (identitiesprop in state.identities) {
            if (state.identities.hasOwnProperty(identitiesprop)) {
              if (identitiesprop !== '$identity_cookie_id' && identitiesprop !== currentLoginKey) {
                delete state.identities[identitiesprop]
              }
            }
          }
          state.history_login_id = {
            name: currentLoginKey,
            value: unionId.login_id
          }
        }
      } else {
        if (
          state.identities.hasOwnProperty('$identity_login_id') ||
          state.identities.hasOwnProperty(old_login_id_name)
        ) {
          for (identitiesprop in state.identities) {
            if (state.identities.hasOwnProperty(identitiesprop)) {
              if (
                identitiesprop !== '$identity_cookie_id' &&
                identitiesprop !== '$identity_anonymous_id'
              ) {
                delete state.identities[identitiesprop]
              }
            }
          }
        }
        state.history_login_id = {
          name: '',
          value: ''
        }
      }

      return state
    }

    const cookieExistExpection = (uuid: any) => {
      this.set('distinct_id', uuid)
      this.set('identities', {
        $identity_cookie_id: uuid
      })
      this.set('history_login_id', {
        name: '',
        value: ''
      })
    }
    this.initSessionState()
    const uuid = UUID()
    let cross, cookieJSON
    if (cookie.isSupport()) {
      cross = cookie.get(this.getCookieName())
      cross = decryptIfNeeded(cross)
      cookieJSON = safeJSONParse(cross)
    }
    if (
      !cookie.isSupport() ||
      cross === null ||
      !isJSONString(cross) ||
      !isObject(cookieJSON) ||
      (isObject(cookieJSON) && !cookieJSON.distinct_id)
    ) {
      ufox.is_first_visitor = true
      cookieExistExpection(uuid)
    } else {
      this._state = extend(compatibleWith3(cookieJSON))
      this.save()
    }
    userInfo.setDeviceId(uuid)
    userInfo.storeInitCheck()
    userInfo.checkIsFirstLatest()
  }

  saveObjectVal(name: any, value: any) {
    if (!isString(value)) {
      value = JSON.stringify(value)
    }
    if (ufox.para.encrypt_cookie == true) {
      value = encrypt(value)
    }
    _localStorage.set(name, value)
  }

  readObjectVal(name: string) {
    let value = _localStorage.get(name)
    if (!value) return null
    value = decryptIfNeeded(value)
    return safeJSONParse(value || '')
  }
}
