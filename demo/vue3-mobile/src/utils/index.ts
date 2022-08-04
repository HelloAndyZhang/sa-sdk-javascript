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
