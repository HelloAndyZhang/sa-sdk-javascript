import { isFunction, isString, trim, isObject, each, isEmptyObject } from '../utils'
import { sdPara, IDENTITY_KEY } from '../Constant'
import ufox from '..'
import Logger from './Logger'

const logger = new Logger({ id: 'EventCheck', enabled: true })
export const checkLog = {
  string: function (str: string) {
    logger.warn(str + ' must be string')
  },
  emptyString: function (str: string) {
    logger.warn(str + "'s is empty")
  },
  regexTest: function (str: string) {
    logger.warn(str + ' is invalid')
  },
  idLength: function (str: string) {
    logger.warn(str + ' length is longer than ' + sdPara.max_id_length)
  },
  keyLength: function (str: string) {
    logger.warn(str + ' length is longer than ' + sdPara.max_key_length)
  },
  stringLength: function (str: string) {
    logger.warn(str + ' length is longer than ' + sdPara.max_string_length)
  },
  voidZero: function (str: string) {
    logger.warn(str + "'s is undefined")
  },
  reservedLoginId: function (str: string) {
    logger.warn(str + ' is invalid')
  },
  reservedBind: function (str: string) {
    logger.warn(str + ' is invalid')
  },
  reservedUnbind: function (str: string) {
    logger.warn(str + ' is invalid')
  }
}
export const ruleOption = {
  regName:
    /^((?!^distinct_id$|^original_id$|^time$|^properties$|^id$|^first_id$|^second_id$|^users$|^events$|^event$|^user_id$|^date$|^datetime$|^user_tag.*|^user_group.*)[a-zA-Z_$][a-zA-Z\d_$]*)$/i,
  loginIDReservedNames: ['$identity_anonymous_id', '$identity_cookie_id'],
  bindReservedNames: ['$identity_login_id', '$identity_anonymous_id', '$identity_cookie_id'],
  unbindReservedNames: ['$identity_anonymous_id', IDENTITY_KEY.LOGIN],
  string: function (str: any) {
    if (!isString(str)) {
      return false
    }
    return true
  },
  emptyString: function (str: any) {
    if (!isString(str) || trim(str).length === 0) {
      return false
    }
    return true
  },
  regexTest: function (str: any) {
    if (!isString(str) || !this.regName.test(str)) {
      return false
    }
    return true
  },
  idLength: function (str: any) {
    if (!isString(str) || str.length > sdPara.max_id_length) {
      return false
    }
    return true
  },
  keyLength: function (str: any) {
    if (!isString(str) || str.length > sdPara.max_key_length) {
      return false
    }
    return true
  },
  stringLength: function (str: any) {
    if (!isString(str) || str.length > sdPara.max_string_length) {
      return false
    }
    return true
  },
  voidZero: function (str: any) {
    if (str === void 0) {
      return false
    }
    return true
  },
  reservedLoginId: function (str: any) {
    if (this.loginIDReservedNames.indexOf(str) > -1) {
      return false
    }
    return true
  },
  reservedUnbind: function (str: any) {
    if (this.unbindReservedNames.indexOf(str) > -1) {
      return false
    }
    return true
  },
  reservedBind: function (str: any) {
    const historyId = ufox.store._state.history_login_id
    if (historyId && historyId.name && historyId.name === str) {
      return false
    }
    if (this.bindReservedNames.indexOf(str) > -1) {
      return false
    }
    return true
  }
}
export const checkOption = {
  distinct_id: {
    rules: ['string', 'emptyString', 'idLength'],
    onComplete: function (status: string, val: string, rule_type: string) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'Id'
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
        if (rule_type === 'idLength') {
          return true
        }
      }

      return status
    }
  },
  event: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest'],
    onComplete: function (status: string, val: string, rule_type: string) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'eventName'
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
      }
      return true
    }
  },
  propertyKey: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest'],
    onComplete: function (status: string, val: string, rule_type: string) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'Property key'
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
      }
      return true
    }
  },
  propertyValue: {
    rules: ['voidZero'],
    onComplete: function (status: any, val: any, rule_type: any) {
      if (!status) {
        val = 'Property Value'
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
      }
      return true
    }
  },
  properties: function (p: any) {
    if (isObject(p)) {
      each(p, (s: any, k: any) => {
        check({
          propertyKey: k
        })

        const onComplete = function (status: any, val: any, rule_type: any) {
          if (!status) {
            val = k + "'s Value"
            isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
          }
          return true
        }
        check(
          {
            propertyValue: s
          },
          onComplete
        )
      })
    } else if (ruleOption.voidZero(p)) {
      logger.log('properties可以没有，但有的话必须是对象')
    }
    return true
  },
  propertiesMust: function (p: any) {
    if (!(p === undefined || !isObject(p) || isEmptyObject(p))) {
      this.properties.call(this, p)
    } else {
      logger.log('properties必须是对象')
    }
    return true
  },
  item_type: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest'],
    onComplete: function (status: any, val: any, rule_type: any) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'item_type'
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
      }
      return true
    }
  },
  item_id: {
    rules: ['string', 'emptyString', 'stringLength'],
    onComplete: function (status: any, val: any, rule_type: any) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'item_id'
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
      }
      return true
    }
  },
  loginIdKey: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest', 'reservedLoginId'],
    onComplete: function (status: any, val: any, rule_type: any) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'login_id_key'
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
        if (rule_type === 'keyLength') {
          return true
        }
      }
      return status
    }
  },
  bindKey: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest', 'reservedBind'],
    onComplete: function (status: any, val: any, rule_type: any) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'Key'
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
        if (rule_type === 'keyLength') {
          return true
        }
      }
      return status
    }
  },
  unbindKey: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest', 'reservedUnbind'],
    onComplete: function (status: any, val: any, rule_type: any) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'Key'
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
        if (rule_type === 'keyLength') {
          return true
        }
      }
      return status
    }
  },
  bindValue: {
    rules: ['string', 'emptyString', 'idLength'],
    onComplete: function (status: any, val: any, rule_type: any) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'Value'
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val)
        if (rule_type === 'idLength') {
          return true
        }
      }
      return status
    }
  },
  check: function (a: string, b: any, onComplete?: any) {
    var checkRules = this[a]
    if (isFunction(checkRules)) {
      return checkRules.call(this, b)
    } else if (!checkRules) {
      return false
    }
    for (var i = 0; i < checkRules.rules.length; i++) {
      var rule = checkRules.rules[i]
      var status = ruleOption[rule](b)
      //@ts-ignore
      var result = isFunction(onComplete)
        ? onComplete(status, b, rule)
        : checkRules.onComplete(status, b, rule)
      if (!status) {
        return result
      }
    }
    return true
  }
}

//校验事件参数
export default function check(p: any, onComplete?: any) {
  for (var i in p) {
    if (Object.prototype.hasOwnProperty.call(p, i) && !checkOption.check(i, p[i], onComplete)) {
      return false
    }
  }
  return true
}
