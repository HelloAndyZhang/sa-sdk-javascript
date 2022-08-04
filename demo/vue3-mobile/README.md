基于`Vue3`、`VueCli@5.0`、`Vite@2.0`的移动端脚手架

## 功能

- 支持使用`Vite`开发，`VueCli`进行构建的开发模式，详情见`package.json`中`dev`以及`build`命令
- 内置[Fun-UI](https://bomb.uupt.com/Fun-UI/index.html)组件库，组件自动按需引入，如`Fun-UI`组件自动引入。详情可见`views/index.vue`中的使用
- 基于`vue-router@4.0`的路由管理
- [Pinia](https://pinia.vuejs.org/) 状态管理，下一代的状态管理
- 移动端适配，目前使用`rem`适配方案，相关插件`amfe-flexible`以及`postcss-pxtorem`
- less 文件自动引入全局变量文件，详情见`src/styles/variables.less`文件
- `NProgress`，路由加载进度反馈
- `yorkie` + `prettier` + `eslint` + `commitizen` + `lint-staged` 统一代码风格以及提交规范，保存代码自动格式化代码以及修改 lint 错误
- 打包后针对`js、css`文件生成`gzip`文件，提升页面资源加载速度
- 一键生成`CHANGELOG`文件，便于管理项目版本变更记录，详情见`npm run release`命令
- `Vite`开发模式下支持 mock 数据，详情见`mock`文件夹以及`/src/api`文件夹示例
- 自动引入以及注册全局组件，`src/components`以及`src/layouts`下的组件将会被自动注册为全局组件
- 抽离 CDN 外部依赖，如`Vue`、`VueRouter`，减少文件打包体积
- 集成 Sentry 配置，修改 Sentry 参数以及构建命令即可

## 目录规范

```
.
├── .vscode  //vscode配置
├── mock   //mock服务
├── preset //插件管理
│   ├── config.js  //一些构建配置项文件
│   ├── viteConfig.js //vite的配置文件
│   └── webpackConfig.js //vueCli的配置文件
├── public  //静态资源目录
├── scripts  //一些脚本工具
│   └── sentry // 关于sentry的脚本
│   └── template // 命令生成页面、组件的脚本
│   └── utils.js // 脚本命令工具函数
├── src
│   ├── services  //接口管理文件夹
│   ├── assets //资源文件夹，如图片、字体等
│   ├── components //全局组件，会自动注册，根据文件名以及文件夹名称
│   ├── layouts //布局组件，如Header以及Footer组件
│   ├── router //路由管理
│   ├── store //pinia状态管理
│   ├── styles //样式文件
│   ├── libs //一些插件库
│   ├── utils
│   │   └── http.js //@uupt/request(umi-request)请求封装
│   │   └── index.js //一些常用方法封装
│   ├── views //页面文件夹
│   ├── App.vue //主入口.vue文件
│   └── main.js //入口文件
├── zip //打包生成的zip文件夹
├── package.json
├── vue.config.js //vuecli配置文件
└── vite.config.js //vite配置文件
└── index.html //模板html文件

```

## 拉取模板

可通过`@uupt/cli`命令行工具拉取该脚手架， 详情安装步骤查看[文档](https://bomb.uupt.com/library/packages/cli/README.html)

安装之前需要先配置`cnpm`私有库源，详情查看[cnpm 使用常见问题](https://unote.uupt.com/uunote/#/searchDoc/12836?doc_key=7L%20OP41SM%208%3D)，按照文档配置全局`scope`镜像地址。

安装完毕后，运行

```shell
degit https://uugit.uupt.com/Web/PubLibs/M/uupt.basevuetemplate.web  myproject
```

## 构建命令

### 开发

```shell
npm run dev
```

默认使用`vite`开发，如想使用`vueCli`进行开发,可执行`npm run dev:cli`

`vite` 服务启动后，自带`mock`服务，详情见`mock`文件夹以及`services`中的使用

### 构建

```shell
npm run build
```

打包完成后会自动在`zip`文件夹下生成`zip文件`，如果需要指定打包生成的 zip 文件备注，可增加`--note`参数。如下:

```shell
npm run build --note 这是打包备注
```

默认使用`VueCli`打包，如想使用`vite`打包，可执行`npm run build:vite` .

> 移动端尽量使用`VueCli` 打包

### sentry 构建

```shell
npm run build:sentry
```

此命令会自动删除以及上传对应 sentry 项目`sourcemap`文件，前提需要先配置如下参数:

- `.sentryclirc` 文件中的`token`,`project` 参数
- `sentry.config.js` 文件中的`release`,`dsn`,`urlPrefix`参数

[sentry 使用文档](https://unote.uupt.com/uunote/#/searchDoc/17303?doc_key=DHoJsF6ZkQI%3D)

最后在`main.js`入口文件中引入`sentry`文件并实例化

```js
import sentry from "@/libs/sentry";
// 生产环境启用sentry
if (process.env.NODE_ENV == "production") {
  sentry.init();
}
```

### 打包体积分析

```shell
npm run build:analyze
```

### 代码美化

```shell
npm run prettier
```

### 自动修复 eslint 语法错误

```shell
npm run lint
```

### Git 提交规范语句面板

```shell
npm run commit
```

规范的`commit`信息有利于项目的维护以及生成规范的 CHANGELOG 文件。
这里使用的是`Angular`团队的提交规范，大致如下:

```
feat: 新特性
fix: Bug修复
docs: 文档更改
style: 样式修复
refactor: 代码重构
perf:  优化相关，比如提升性能、体验
test: 增加一些测试代码、用例
build: 更改了一些依赖、打包相关的配置
ci: ci/cd相关变动，比如docker配置文件
chore: 改变构建流程、增加依赖库、工具等
revert: 回滚
```

如果你喜欢用 vscode 来提交代码，推荐安装此插件`git-commit-plugin`

### 生成 CHANGELOG.md 文件

```shell
npm run release
```

该命令执行后，会自动帮你更新`package.json`中的版本号以及生成 CHANGELOG.md 文件，并创建对应版本 tag，进行`git commit`

更新`major`版本号

```shell
npm run release -- --release-as major
# 1.0.0=>2.0.0
```

更新`minor`版本号

```shell
npm run release -- --release-as minor
# 1.0.0=>1.1.0
```

更新`patch`版本号

```shell
npm run release -- --release-as patch
# 1.0.0=>1.0.1
```

更新到指定版本号

```shell
npm run release -- --release-as 1.3.0
# 1.0.0=>1.3.0
```

### 新增页面文件

```shell
npm run add:page
```

### 新增全局组件

```shell
npm run add:component
```

## 相关构建配置

相关构建配置参数见`./preset/config.js`，有详细说明

```js
{
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
    'vue-router': 'VueRouter',
    axios: 'axios',
    vue: 'Vue'
  },
  // 页面标题信息
  htmlConfig: {
    title: 'UU跑腿',
    description: '同城急事 找UU跑腿',
    keywords: 'UU跑腿'
  },
  // 向less文件注入变量
  lessAdditionalData: `@import '@styles/variables.less';`,
  // cdn列表
  cdnList: {
  },
  // 编译依赖名单  如第三方依赖存在es6语法 可配置在下方进行编译 如pinia
  transpileDependencies: ['pinia']
}
```

## 组件自动引入

该功能使用了[unplugin-vue-components](https://github.com/antfu/unplugin-vue-components) 插件来实现。

以`Fun-UI` 为例，在`index.vue`中

```js
<template>
  <fun-button>我是FunUI的按钮</fun-button>
</template>
```

当检测到有`Fun-UI`的组件标签式，该插件会自动引入对应组件的依赖以及样式，无需手动注册组件

`src/components`下的全局组件同理，其组件名称命名规则为以`.vue`文件名或文件夹名称为准.

如`HelloWorld.vue` =>`<HelloWorld/>` 、`TestComponent/index.vue`=>`<TestComponent/>`

## 注意事项

- 由于开发环境使用的是`Vite`，所以尽量使用`ESModule`规范，不要出现`require`语句，也有利于`treeshaking`，减少无用代码

- 目前该脚手架不是插拔式的，集成了所有配置，做项目时视情况而定，需要手动删减不需要的模块，如`VueRouter`、`pinia`，后续提供命令行工具可选配置支持。

## VsCode 插件

在`.vscode`文件夹下`settings.json`中包含了一些推荐插件，`ESlint`、`EditorConfig`、`prettier`，在 vscode 插件搜索框输入`@recommended `即可安装，这三个插件必须安装且处于开启状态。

## TODO

[] 路由自动注册

[] 支持插拔式配置

...
欢迎补充
