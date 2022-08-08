import Stage from './Stage'
import {
  isObject,
  isArray,
  each,
  isString,
  isDate,
  isBoolean,
  isFunction,
  isNumber,
  searchObjDate
} from '../../utils'
import { sdPara } from '../../Constant'
import check from '../../helper/EventCheck'
let processDef = {
  addCustomProps: null,
  formatData: null
}

export let dataStage = new Stage(processDef)

export let dataStageImpl = {
  stage: null,
  init: function (stage: any) {
    this.stage = stage
  }
}
function strip_sa_properties(p: any) {
  if (!isObject(p)) {
    return p
  }
  each(p, function (v: any, k: any) {
    if (isArray(v)) {
      var temp: any = []
      each(v, function (arrv: any) {
        if (isString(arrv)) {
          temp.push(arrv)
        } else {
          console.warn('您的数据-', k, v, '的数组里的值必须是字符串,已经将其删除')
        }
      })
      p[k] = temp
    }
    if (
      !(
        isString(v) ||
        isNumber(v) ||
        isDate(v) ||
        isBoolean(v) ||
        isArray(v) ||
        isFunction(v) ||
        k === '$option'
      )
    ) {
      console.warn('您的数据-', k, v, '-格式不满足要求，我们已经将其删除')
      delete p[k]
    }
  })
  return p
}

function formatString(str: any, maxLen: any) {
  if (isNumber(maxLen) && str.length > maxLen) {
    console.warn('字符串长度超过限制，已经做截取--' + str)
    return str.slice(0, maxLen)
  } else {
    return str
  }
}

function filterReservedProperties(obj: any) {
  var reservedFields = [
    'distinct_id',
    'user_id',
    'id',
    'date',
    'datetime',
    'event',
    'events',
    'first_id',
    'original_id',
    'device_id',
    'properties',
    'second_id',
    'time',
    'users'
  ]
  if (!isObject(obj)) {
    return
  }
  each(reservedFields, function (key: any, index: any) {
    if (!(key in obj)) {
      return
    }
    if (index < 3) {
      delete obj[key]
      console.warn('您的属性- ' + key + '是保留字段，我们已经将其删除')
    } else {
      console.warn('您的属性- ' + key + '是保留字段，请避免其作为属性名')
    }
  })
}

function searchObjString(o: any) {
  var white_list = ['$element_selector', '$element_path']
  var infinite_list = ['sensorsdata_app_visual_properties']
  if (isObject(o)) {
    each(o, function (a: any, b: any) {
      if (isObject(a)) {
        searchObjString(o[b])
      } else {
        if (isString(a)) {
          if (infinite_list.indexOf(b) > -1) {
            return
          }
          o[b] = formatString(a, white_list.indexOf(b) > -1 ? 1024 : sdPara.max_string_length)
        }
      }
    })
  }
}

function searchZZAppStyle(data: any) {
  if (typeof data.properties.$project !== 'undefined') {
    data.project = data.properties.$project
    delete data.properties.$project
  }
  if (typeof data.properties.$token !== 'undefined') {
    data.token = data.properties.$token
    delete data.properties.$token
  }
}

function formatItem(data: any) {
  if ('item_type' in data) {
    var item_type = data['item_type']

    var typeOnComplete = function (status: any) {
      if (!status) {
        delete data['item_type']
      }
      return true
    }

    check(
      {
        item_type: item_type
      },
      typeOnComplete
    )
  }
  if ('item_id' in data) {
    var item_id = data['item_id']
    var idOnComplete = function (status: string, val: string, rule: string) {
      if (!status && rule === 'string') {
        delete data['item_id']
      }
      return true
    }
    check(
      {
        item_id: item_id
      },
      idOnComplete
    )
  }
}

function formatProperties(p: any) {
  each(p, function (val: any, key: any) {
    var onComplete = function (status: string, value: any, rule_type: any) {
      if (!status && rule_type !== 'keyLength') {
        delete p[key]
      }
      return true
    }
    check(
      {
        propertyKey: key
      },
      onComplete
    )
  })
}

function formatData(data: any) {
  var p = data.properties

  if (isObject(p)) {
    strip_sa_properties(p)

    filterReservedProperties(p)

    searchZZAppStyle(data)

    formatProperties(p)

    searchObjString(p)
  } else if ('properties' in data) {
    data.properties = {}
  }

  searchObjDate(data)

  formatItem(data)
}

export let dataStageImpl$1 = {
  init: function () {},
  interceptor: {
    formatData: {
      priority: 0,
      entry: function (data: any) {
        formatData(data)
        return data
      }
    }
  }
}

export function processAddCustomProps(data: any) {
  //@ts-ignore
  return dataStageImpl.stage.process('addCustomProps', data)
}
export function processFormatData(data: any) {
  //@ts-ignore
  return dataStageImpl.stage.process('formatData', data)
}
