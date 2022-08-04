export default class ReadyState {
  state: number
  historyState: Array<string>
  stateType: Record<number, string>
  constructor() {
    this.state = 0
    this.historyState = []
    this.stateType = {
      1: '1-init未开始',
      2: '2-init开始',
      3: '3-store完成'
    }
  }

  getState() {
    return this.historyState.join('\n')
  }

  setState(n: number) {
    if (String(n) in this.stateType) {
      this.state = n
    }
    this.historyState.push(this.stateType[n])
  }
}
