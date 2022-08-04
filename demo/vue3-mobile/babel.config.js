module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'import',
      {
        libraryName: '@FunUI/Fun-UI',
        libraryDirectory: 'es',
        style: true
      },
      '@FunUI/Fun-UI'
    ],
    '@babel/plugin-proposal-optional-chaining'
  ]
}
