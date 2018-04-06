const path = require('path')

module.exports = [
  {
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'immy.min.js',
      library: 'immy',
      libraryTarget: 'umd',
      globalObject: 'this'
    }
  },
  {
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'immy.js',
      library: 'immy',
      libraryTarget: 'umd',
      globalObject: 'this'
    },
    optimization: {
      minimize: false
    }
  }
]
