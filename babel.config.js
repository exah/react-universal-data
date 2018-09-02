const IS_ESM = process.env.MODULES !== 'cjs'

module.exports = {
  presets: [
    '@babel/preset-flow',
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        modules: IS_ESM ? false : 'commonjs',
        loose: true
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    [ '@babel/plugin-transform-runtime', { useESModules: IS_ESM } ],
    [ '@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true, loose: true } ]
  ]
}
