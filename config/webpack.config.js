const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const paths = require('./paths');
const babelOptions = require('./babel');
const pkg = require('../package.json');

const config = {

  entry: {
    app: path.join(paths.reactAppSrc, '/index.js'),
    'react-vendors': Object.keys(pkg.dependencies)
  },

  output: {
    path: paths.appPath,
    publicPath: paths.publicPath
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
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['react-vendors', 'manifest']
    })
  ]

};

module.exports = config;
