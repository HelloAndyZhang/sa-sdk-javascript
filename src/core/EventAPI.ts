import {
  extend,
  isObject,
  _localStorage,
  getURL,
  isFunction,
  each,
  getReferrer,
  getURLPath,
  getHostname
} from '../utils'
import { addHashEvent } from '../helper/addEvent'
import userInfo from './UserInfo'
import { IDENTITY_KEY } from '../Constant'
import Core from './Core'

class EventAPI extends Core {
  constructor(...rest: []) {
    super(...rest)
  }
  track(event: string, properties?: Partial<Properties>, callback?: CallBack) {
    if (
      this.check({
        event: event,
        properties: properties
      })
    ) {
      const data = this.kit.buildData({
        type: 'track',
        event: event,
        properties: properties
      })
      this.kit.sendData(data, callback)
    }
  }

  quick(event: string, para: any) {
    if (event === 'autoTrack') {
      this.autoTrack(para)
    }
  }

  autoTrack(para: Partial<Properties>, callback?: CallBack) {
    para = isObject(para) ? para : {}

    const utms = this.pageInfo.campaignParams()
    const $utms: Record<string, string> = {}
    each(utms, (_v: string, i: string, utms: Record<string, string>) => {
      if ((' ' + this.source_channel_standard + ' ').indexOf(' ' + i + ' ') !== -1) {
        $utms['$' + i] = utms[i]
      } else {
        $utms[i] = utms[i]
      }
    })

    if (para.not_set_profile) {
      delete para.not_set_profile
    }

    let current_page_url = location.href

    if (this.para.is_single_page) {
      addHashEvent(() => {
        const referrer = getReferrer(current_page_url, true)
        this.track(
          '$pageview',
          extend(
            {
              $referrer: referrer,
              $url: getURL(),
              $url_path: getURLPath(),
              $title: document.title
            },
            $utms,
            para
          ),
          callback
        )
        current_page_url = getURL()
      })
    }
    this.track(
      '$pageview',
      extend(
        {
          $referrer: getReferrer(null, true),
          $url: getURL(),
          $url_path: getURLPath(),
          $title: document.title
        },
        $utms,
        para
      ),
      callback
    )
  }

  register(props: any) {
    if (
      this.check({
        properties: props
      })
    ) {
      this.store.setProps(props)
    } else {
      this.logger.log('register输入的参数有误')
    }
  }

  login(id: string | number, callback?: any) {
    if (typeof id === 'number') {
      id = String(id)
    }
    const returnValue = this.loginBody({
      id: id,
      callback: callback,
      name: IDENTITY_KEY.LOGIN
    })
    !returnValue && isFunction(callback) && callback()
  }

  loginBody(obj: any) {
    const id = obj.id
    const callback = obj.callback
    const name = obj.name

    const firstId = this.store.getFirstId()
    const distinctId = this.store.getOriginDistinctId()

    if (
      !this.check({
        distinct_id: id
      })
    ) {
      this.logger.log('login id is invalid')
      return false
    }
    if (id === this.store.getOriginDistinctId() && !firstId) {
      this.logger.log('login id is equal to distinct_id')
      return false
    }
    if (
      isObject(this.store._state.identities) &&
      this.store._state.identities.hasOwnProperty(name) &&
      id === this.store._state.first_id
    ) {
      return false
    }

    const isNewLoginId =
      this.store._state.history_login_id.name !== name ||
      id !== this.store._state.history_login_id.value
    if (isNewLoginId) {
      this.store._state.identities[name] = id
      this.store.set('history_login_id', {
        name: name,
        value: id
      })

      if (!firstId) {
        this.store.set('first_id', distinctId)
      }

      this.sendSignup(id, '$SignUp', {}, callback)

      const tempObj = {
        $identity_cookie_id: this.store._state.identities.$identity_cookie_id
      }
      tempObj[name] = id
      this.resetIdentities(tempObj)
      return true
    }
    return false
  }

  private sendSignup(id: any, e: any, p: any, c: any) {
    const original_id = this.store.getFirstId() || this.store.getDistinctId()
    this.store.set('distinct_id', id)
    const data = this.kit.buildData({
      original_id: original_id,
      distinct_id: this.store.getDistinctId(),
      type: 'track_signup',
      event: e,
      properties: p
    })
    this.kit.sendData(data, c)
  }

  private resetIdentities(resetObj: any) {
    const identities = {}
    for (const i in resetObj) {
      identities[i] = resetObj[i]
    }
    this.store._state.identities = identities
    this.store.save()
  }

  registerPage(obj: any) {
    if (
      this.check({
        properties: obj
      })
    ) {
      this.pageInfo.register(obj)
    } else {
      this.logger.log('register输入的参数有误')
    }
  }

  getPresetProperties() {
    const getUtm = () => {
      const utms = this.pageInfo.campaignParams()
      const $utms = {}
      each(utms, (_v: any, i: any, utms: any) => {
        if ((' ' + this.source_channel_standard + ' ').indexOf(' ' + i + ' ') !== -1) {
          $utms['$' + i] = utms[i]
        } else {
          $utms[i] = utms[i]
        }
      })
      return $utms
    }

    const obj = {
      $is_first_day: userInfo.isNewUser(),
      $is_first_time: userInfo.is_page_first_visited,
      $referrer: this.pageInfo.pageProp.referrer || '',
      $referrer_host: this.pageInfo.pageProp.referrer
        ? getHostname(this.pageInfo.pageProp.referrer)
        : '',
      $url: getURL(),
      $url_path: getURLPath(),
      $title: document.title || '',
      _distinct_id: this.store.getDistinctId(),
      identities: JSON.parse(JSON.stringify(this.store._state.identities))
    }
    const result = extend({}, this.pageInfo.properties(), this.store.getProps(), getUtm(), obj)
    if (
      this.para.preset_properties.latest_referrer &&
      this.para.preset_properties.latest_referrer_host
    ) {
      result.$latest_referrer_host =
        result.$latest_referrer === '' ? '' : getHostname(result.$latest_referrer)
    }
    return result
  }
}

export default EventAPI
