const path = require('path')

module.exports = [
  {
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'immy.min.js',
      library: 'immy',
      libraryTarget: 'commonjs2'
    }
  },
  {
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'immy.js',
      library: 'immy',
      libraryTarget: 'commonjs2'
    },
    optimization: {
      minimize: false
    }
  }
]
