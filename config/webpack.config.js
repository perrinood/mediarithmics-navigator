const path = require('path');
const webpack = require('webpack');

const paths = require('./paths');
const babelOptions = require('./babel');
const pkg = require('../package.json');

const config = {

  entry: {
    app: path.join(paths.reactAppSrc, '/index.js'),
    'react-vendors': Object.keys(pkg.dependencies)
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: paths.reactAppSrc,
        use: 'eslint-loader',
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        include: paths.reactAppSrc,
        use: {
          loader: 'babel-loader',
          options: babelOptions
        }
      }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ['react-vendors', 'manifest']
    })
  ]

};

module.exports = config;
