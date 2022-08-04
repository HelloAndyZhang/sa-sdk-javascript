import NodePath from 'path'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace'
const Package = require('./package.json')
const resolveFile = path => NodePath.resolve(__dirname, path)

// 通用插件
const plugins = [
  resolve(),
  babel({
    babelHelpers: 'runtime',
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false
        }
      ]
    ],
    plugins: ['@babel/plugin-transform-runtime']
  }),
  replace({
    preventAssignment: true,
    __MICRO_APP_VERSION__: Package.version,
    __TEST__: 'false'
  }),
  typescript({
    tsconfig: resolveFile('tsconfig.json')
  })
]
if (process.env.NODE_ENV === 'production') {
  plugins.push(terser({ ecma: 5 }))
}

// 通用配置
const config = {
  input: resolveFile('src/index.ts'),
  external: [/@babel\/runtime/].filter(Boolean),
  output: [
    {
      file: resolveFile(Package.module),
      format: 'es',
      sourcemap: true
    },
    {
      file: resolveFile(Package.main),
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: resolveFile('lib/index.umd.js'),
      format: 'umd',
      sourcemap: true,
      exports: 'named',
      name: 'sensors'
    }
  ],
  plugins: [...plugins]
}

export default config
