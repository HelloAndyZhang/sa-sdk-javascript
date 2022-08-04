import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import routes from './routes'
import NProgress from 'nprogress'

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
  const title = (to.meta.title || '') as string
  title && (document.title = title)
  if (!NProgress.isStarted()) {
    NProgress.start()
  }
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
