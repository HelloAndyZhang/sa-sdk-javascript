import { trim, each, getURL, getURLPath } from './index'
export function getElementContent(element: any, tagName: string) {
  let textContent = ''
  let element_content = ''
  if (element.textContent) {
    textContent = trim(element.textContent)
  } else if (element.innerText) {
    textContent = trim(element.innerText)
  }
  if (textContent) {
    textContent = textContent
      .replace(/[\r\n]/g, ' ')
      .replace(/[ ]+/g, ' ')
      .substring(0, 255)
  }
  element_content = textContent || ''

  if (tagName === 'input' || tagName === 'INPUT') {
    element_content = element.value || ''
  }
  return element_content
}
export function getEleInfo(obj: any) {
  if (!obj.target) {
    return false
  }

  const target = obj.target
  const tagName = target.tagName.toLowerCase()

  let props: any = {}

  props.$element_type = tagName
  props.$element_name = target.getAttribute('name')
  props.$element_id = target.getAttribute('id')
  props.$element_class_name = typeof target.className === 'string' ? target.className : null
  props.$element_target_url = target.getAttribute('href')
  props.$element_content = getElementContent(target, tagName)
  props = strip_empty_properties(props)
  props.$url = getURL()
  props.$url_path = getURLPath()
  props.$title = document.title

  return props
}
export function strip_empty_properties(p: any) {
  const ret = {}
  each(p, function (v: string, k: string) {
    if (v != null) {
      ret[k] = v
    }
  })
  return ret
}
