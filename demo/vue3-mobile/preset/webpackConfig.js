const autoImportComponent = require('unplugin-vue-components/webpack')
const {
  outDir,
  lessAdditionalData,
  devServerConfig,
  cdnList,
  externals,
  htmlConfig,
  transpileDependencies,
  publicPath
} = require('./config')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const SentryWebpackPlugin = require('@sentry/webpack-plugin')
const { kebabCase, resolve, isProd } = require('../scripts/utils')
const packageJson = require('../package.json')
const useSentry = process.env.USESENTRY
const sentryConfig = require('../sentry.config')
let plugins = [
  // @ts-ignore
  autoImportComponent({
    dirs: [resolve('src/components'), resolve('src/layouts')],
    directoryAsNamespace: true,
    dts: false,
    resolvers: [
      name => {
        // FUN-UI自动引入组件以及样式
        const tagName = name.slice(3)
        if (name.startsWith('Fun') && name !== 'FunDialog') {
          return {
            importName: tagName,
            path: '@FunUI/Fun-UI/es',
            sideEffects: `@FunUI/Fun-UI/es/${kebabCase(tagName)}/style/index.js`
          }
        }
      }
    ]
  })
]
if (isProd) {
  plugins = [
    ...plugins,
    new CompressionWebpackPlugin({
      // gzip 压缩
      filename: '[path][base].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(js|css)$' // 压缩 js 与 css
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  ]
  // 启用sentry 上传sourcemap文件
  if (useSentry) {
    plugins.push(
      new SentryWebpackPlugin({
        include: resolve('dist'),
        release: `${sentryConfig.release}@${packageJson}`,
        urlPrefix: sentryConfig.urlPrefix
      })
    )
  }
}
module.exports = {
  // 部署应用的的基本URL
  publicPath: publicPath,
  // 打包路径 统一为dist
  outputDir: outDir,
  css: {
    sourceMap: false,
    loaderOptions: {
      less: {
        // 注入全局less变量
        additionalData: lessAdditionalData
      }
    }
  },
  // 开启eslint检测
  lintOnSave: !isProd,
  chainWebpack: config => {
    // 修复热更新
    config.resolve.symlinks(true)
    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@assets', resolve('src/assets'))
      .set('@components', resolve('src/components'))
      .set('@services', resolve('src/services'))
      .set('@views', resolve('src/views'))
      .set('@layouts', resolve('src/layouts'))
      .set('@styles', resolve('src/styles'))
      .set('@store', resolve('src/store'))
      .set('@utils', resolve('src/utils'))
    config.plugin('html').tap(args => {
      args[0].cdn = cdnList
      args[0].htmlConfig = htmlConfig
      args[0].template = resolve('index.html')
      return args
    })
    // 配置外部依赖
    config.externals(externals)
    // @ts-ignore
    if (isProd && process.env.ANALYZE == 1) {
      config.plugin('webpack-report').use(BundleAnalyzerPlugin, [
        {
          analyzerMode: 'static'
        }
      ])
    }
  },
  devServer: devServerConfig,
  configureWebpack: {
    plugins: plugins,
    module: {
      rules: [
        {
          // 修复引入mjs
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        }
      ]
    }
  },
  // eslint-disable-next-line no-unneeded-ternary
  productionSourceMap: useSentry ? true : false,
  transpileDependencies
}
