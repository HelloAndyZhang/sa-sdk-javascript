module.exports = {
  plugins: {
    autoprefixer: {},
    // 移动端项目开启此插件  将px转为rem
    'postcss-pxtorem': {
      rootValue: 75,
      propList: ['*']
    }
  }
}
