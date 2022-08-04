import { isElement, isUndefined, isArray } from '../utils/validate'
export default class DomElementInfo {
  ele: HTMLElement

  constructor(ele: HTMLElement) {
    this.ele = ele
  }

  addClass(para: string) {
    const classes = ' ' + this.ele.className + ' '
    if (classes.indexOf(' ' + para + ' ') === -1) {
      this.ele.className = this.ele.className + (this.ele.className === '' ? '' : ' ') + para
    }
    return this
  }

  removeClass(para: string) {
    const classes = ' ' + this.ele.className + ' '
    if (classes.indexOf(' ' + para + ' ') !== -1) {
      this.ele!.className = classes.replace(' ' + para + ' ', ' ').slice(1, -1)
    }
    return this
  }

  hasClass(para: string) {
    const classes = ' ' + this.ele.className + ' '
    if (classes.indexOf(' ' + para + ' ') !== -1) {
      return true
    } else {
      return false
    }
  }

  attr(key: string, value: string) {
    if (typeof key === 'string' && isUndefined(value)) {
      return this.ele.getAttribute(key)
    }
    if (typeof key === 'string') {
      value = String(value)
      this.ele.setAttribute(key, value)
    }
    return this
  }

  offset() {
    const rect = this.ele.getBoundingClientRect()
    if (rect.width || rect.height) {
      const doc = this.ele.ownerDocument
      const docElem = doc.documentElement

      return {
        top: rect.top + window.pageYOffset - docElem!.clientTop,
        left: rect.left + window.pageXOffset - docElem!.clientLeft
      }
    } else {
      return {
        top: 0,
        left: 0
      }
    }
  }

  getSize() {
    if (!window.getComputedStyle) {
      return {
        width: this.ele.offsetWidth,
        height: this.ele.offsetHeight
      }
    }
    try {
      const bounds = this.ele?.getBoundingClientRect()
      return {
        width: bounds.width,
        height: bounds.height
      }
    } catch (e) {
      return {
        width: 0,
        height: 0
      }
    }
  }

  getStyle(value: string) {
    // @ts-ignore
    if (this.ele.currentStyle) {
      // @ts-ignore
      return this.ele!.currentStyle[value]
    } else {
      // @ts-ignore
      return this.ele.ownerDocument.defaultView
        .getComputedStyle(this.ele, null)
        .getPropertyValue(value)
    }
  }

  wrap(elementTagName: string) {
    const ele = document.createElement(elementTagName)
    this.ele.parentNode?.insertBefore(ele, this.ele)
    ele.appendChild(this.ele)
    return ry(ele)
  }

  getCssStyle(prop: string) {
    let result = this.ele.style.getPropertyValue(prop)
    if (result) {
      return result
    }
    let rules = null
    if (typeof window.getMatchedCSSRules === 'function') {
      rules = window.getMatchedCSSRules(this.ele)
    }
    if (!rules || !isArray(rules)) {
      return null
    }
    for (let i = rules.length - 1; i >= 0; i--) {
      const r: any = rules[i]
      result = r.style.getPropertyValue(prop)
      if (result) {
        return result
      }
    }
    return null
  }

  sibling(cur: any, dir: any) {
    while ((cur = cur[dir]) && cur.nodeType !== 1) {}
    return cur
  }

  next() {
    return this.sibling(this.ele, 'nextSibling')
  }

  prev() {
    return this.sibling(this.ele, 'previousSibling')
  }

  siblings() {
    return siblings((this.ele.parentNode || {}).firstChild, this.ele)
  }

  children() {
    return siblings(this.ele.firstChild)
  }

  parent() {
    let parent: any = this.ele.parentNode
    parent = parent && parent.nodeType !== 11 ? parent : null
    return ry(parent)
  }

  previousElementSibling() {
    let el: any = this.ele
    if ('previousElementSibling' in document.documentElement) {
      return ry(el.previousElementSibling)
    } else {
      while ((el = el.previousSibling)) {
        if (el.nodeType === 1) {
          return ry(el)
        }
      }
      // @ts-ignore
      return ry(null)
    }
  }

  getSameTypeSiblings() {
    const element = this.ele
    const parentNode = element.parentNode as HTMLElement
    const tagName = element.tagName.toLowerCase()
    const arr = []
    for (let i = 0; i < parentNode.children.length; i++) {
      const child = parentNode.children[i]
      if (child.nodeType === 1 && child.tagName.toLowerCase() === tagName) {
        arr.push(parentNode!.children[i])
      }
    }
    return arr
  }

  getParents() {
    try {
      let element = this.ele
      if (!isElement(element)) {
        return []
      }
      const pathArr = [element]
      if (element === null || element.parentElement === null) {
        return []
      }
      while (element.parentElement !== null) {
        element = element.parentElement
        pathArr.push(element)
      }
      return pathArr
    } catch (err) {
      return []
    }
  }
}
const siblings = function (n: any, elem?: any) {
  const matched = []

  for (; n; n = n.nextSibling) {
    if (n.nodeType === 1 && n !== elem) {
      matched.push(n)
    }
  }

  return matched
}
export function ry(dom: HTMLElement) {
  return new DomElementInfo(dom)
}
