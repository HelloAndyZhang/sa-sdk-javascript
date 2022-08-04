import { Get } from '@utils/http'
// 获取测试mock 数据
export const getMockData = () => {
  return Get('/mock/get', { test: 4 }, { isLoad: true })
}
