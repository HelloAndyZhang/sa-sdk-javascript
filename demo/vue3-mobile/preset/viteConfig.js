import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { createHtmlPlugin } from 'vite-plugin-html'
import AutoComponentsVite from 'unplugin-vue-components/vite'
import { viteMockServe } from 'vite-plugin-mock'
import {
  devServerConfig,
  lessAdditionalData,
  outDir,
  cdnList,
  externals,
  htmlConfig
} from './config'
import { viteExternalsPlugin } from 'vite-plugin-externals'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import { kebabCase, resolve, isProd } from '../scripts/utils'
import vitePluginImp from 'vite-plugin-imp'

export default defineConfig({
  plugins: [
    vue(),
    // commonjs to esmodule
    viteCommonjs(),
    // 支持组件库按需引入样式
    vitePluginImp({
      // 根据main.js 入口文件自动引入对应组件样式 如toast以及loading
      libList: [
        {
          libName: '@FunUI/Fun-UI',
          libDirectory: 'es',
          style(name) {
            return `@FunUI/Fun-UI/es/${name}/style/index.js`
          }
        }
      ]
    }),
    // @ts-ignore
    AutoComponentsVite({
      dirs: [resolve('src/components'), resolve('src/layouts')],
      directoryAsNamespace: true,
      dts: false,
      resolvers: [
        name => {
          // 根据html标签自动引入以及注册组件
          const tagName = name.slice(3)
          if (name.startsWith('Fun') && name !== 'FunDialog') {
            return {
              importName: tagName,
              path: '@FunUI/Fun-UI/es',
              sideEffects: [`@FunUI/Fun-UI/es/${kebabCase(tagName)}/style/index.js`]
            }
          }
        }
      ]
    }),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    //  自定义vite入口文件 支持ejs语法
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          // 这里与webpack 的html-wepback-plugin 配置项保持统一
          htmlWebpackPlugin: {
            options: {
              cdn: cdnList,
              htmlConfig,
              isVite: 1
            }
          }
        }
      }
    }),
    // 抽离外部依赖
    viteExternalsPlugin(externals),
    // mock接口服务
    viteMockServe({
      mockPath: 'mock',
      localEnabled: !isProd
    })
  ],
  server: devServerConfig,
  resolve: {
    alias: {
      '@': resolve('src'),
      '@assets': resolve('src/assets'),
      '@components': resolve('src/components'),
      '@services': resolve('src/services'),
      '@views': resolve('src/views'),
      '@layouts': resolve('src/layouts'),
      '@styles': resolve('src/styles'),
      '@store': resolve('src/store'),
      '@utils': resolve('src/utils')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: lessAdditionalData
      }
    }
  },
  build: {
    outDir: outDir
  }
})
