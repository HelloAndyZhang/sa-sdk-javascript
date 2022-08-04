import Logger from './Logger'
const logger = new Logger({ id: 'localStorage', enabled: true })
interface URLParserValues {
  Username: string
  Password: string
  Port: string
  Protocol: string
  Host: string
  Path: string
  URL: string
  QueryString: string
  Fragment: string
  Origin: string
  [key: string]: string
}
export class URLParser {
  private _fields: URLParserValues
  public _values: { [key: string]: string }
  private _regex: RegExp
  constructor(url: string) {
    this._fields = {
      Username: '',
      Password: '',
      Port: '',
      Protocol: '',
      Host: '',
      Path: '',
      URL: '',
      QueryString: '',
      Fragment: '',
      Origin: ''
    }
    this._values = {}
    this._regex =
      /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/
    if (typeof url !== 'undefined') {
      this._parse(url)
    }
  }

  setUrl(url: string) {
    this._parse(url)
  }

  _initValues() {
    for (const a in this._fields) {
      this._values[a] = ''
    }
  }

  addQueryString(queryObj: { [key: string]: string }) {
    if (typeof queryObj !== 'object') {
      return
    }
    let query: string = this._values.QueryString
    for (const i in queryObj) {
      if (new RegExp(i + '[^&]+').test(query)) {
        query = query.replace(new RegExp(i + '[^&]+'), i + '=' + queryObj[i])
      } else {
        if (query.slice(-1) === '&') {
          query = query + i + '=' + queryObj[i]
        } else {
          if (query === '') {
            query = i + '=' + queryObj[i]
          } else {
            query = query + '&' + i + '=' + queryObj[i]
          }
        }
      }
    }
    this._values.QueryString = query
  }

  getUrl() {
    let url = ''
    url += this._values.Origin
    url += this._values.Port ? ':' + this._values.Port : ''
    url += this._values.Path
    url += this._values.QueryString ? '?' + this._values.QueryString : ''
    url += this._values.Fragment ? '#' + this._values.Fragment : ''
    return url
  }

  _parse(url: string) {
    this._initValues()

    let b: any = this._regex.exec(url)
    if (!b) {
      logger.log('URLParser::_parse -> Invalid URL')
    }

    const urlTmp = url.split('#')
    const urlPart = urlTmp[0]
    const hashPart = urlTmp.slice(1).join('#')
    b = this._regex.exec(urlPart)
    for (const c in this._fields) {
      const m: string = b[this._fields[c]]
      if (b && typeof m !== 'undefined') {
        this._values[c] = m
      }
    }
    this._values.Hostname = this._values.Host.replace(/:\d+$/, '')
    this._values.Origin = this._values.Protocol + '://' + this._values.Hostname
    this._values.Fragment = hashPart
  }
}
