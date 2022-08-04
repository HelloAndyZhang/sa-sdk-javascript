import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    component: () => import('@views/index.vue'),
    meta: {
      title: 'UU跑腿'
    }
  },
  {
    path: '/result',
    name: 'result',
    component: () => import('@views/result.vue'),
    meta: {
      title: 'result'
    }
  }
]

export default routes
