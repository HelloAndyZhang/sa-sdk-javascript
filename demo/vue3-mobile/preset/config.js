const utils = require('../scripts/utils')
module.exports = {
  // 打包目录
  outDir: 'dist',
  // 静态资源目录
  publicPath: utils.isProd ? './' : '/',
  // 项目对应站点 打包zip的时候使用
  webSite: 'test.uupt.com',
  // devServer配置
  devServerConfig: {
    open: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        ws: true,
        changeOrigin: true
      }
    }
  },
  // 外部依赖
  externals: {
    // 'vue-router': 'VueRouter',
    // vue: 'Vue'
  },
  // 页面标题信息
  htmlConfig: {
    title: 'UU跑腿',
    description: '同城急事 找UU跑腿',
    keywords: 'UU跑腿'
  },
  // 向less文件注入变量
  lessAdditionalData: "@import '@styles/variables.less';",
  // cdn列表 TODO 换vue3 cdn
  cdnList: {
    dev: {
      js: [
        '//uufefile.uupt.com/CDN/js/vue/vue.runtime.dev@2.6.14.js',
        '//uufefile.uupt.com/CDN/js/min-uuid.js',
        '//uufefile.uupt.com/CDN/js/vue/vue-router@3.5.3.js'
      ],
      css: []
    },
    build: {
      js: [
        '//uufefile.uupt.com/CDN/js/vue/vue@2.6.14.min.js',
        '//uufefile.uupt.com/CDN/js/min-uuid.js',
        '//uufefile.uupt.com/CDN/js/vue/vue-router@3.5.3.min.js'
      ],
      css: []
    }
  },
  // 编译依赖名单  如第三方依赖存在es6语法 可配置在下方进行编译 如pinia  @uupt私有库
  transpileDependencies: ['pinia', /@uupt/]
}
