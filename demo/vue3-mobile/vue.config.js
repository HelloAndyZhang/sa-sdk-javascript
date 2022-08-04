const { defineConfig } = require('@vue/cli-service')
const webpackPlugins = require('./preset/webpackConfig')
module.exports = defineConfig({
  ...webpackPlugins
})
