import { getMockData } from '@/services/app'
import { defineStore, acceptHMRUpdate, type StoreDefinition } from 'pinia'

export const useAppStore: StoreDefinition = defineStore('app', {
  state: () => {
    return {
      countNum: 1
    }
  },
  actions: {
    increment() {
      this.countNum++
    },
    // 异步操作
    async asyncIncrement() {
      const data = await getMockData()
      if (data.code == 0) {
        this.countNum++
      }
    }
  },
  getters: {
    dobuleCount: state => state.countNum * 2
  }
})

// 使该模块可以热更新
// @ts-ignore
if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}
