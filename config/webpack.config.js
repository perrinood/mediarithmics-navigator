const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const paths = require('./paths');
const babel = require('./babel');
const pkg = require('../package.json');

const config = {

  entry: {
    app: path.join(paths.appSrc, '/index.js'),
    vendor: Object.keys(pkg.dependencies)
  },

  output: {
    path: paths.appBuild,
    publicPath: paths.public
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
        use: ['eslint-loader'],
        include: paths.appSrc,
        enforce: 'pre',
        exclude: path.join(paths.appSrc, 'components/')
      },
      {
        test: /\.js$/,
        include: paths.appSrc,
        use: [
          {
            loader: 'babel-loader',
            options: babel
          }
        ]
      }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest']
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new webpack.DefinePlugin({
      BASE_NAME: JSON.stringify(paths.public)
    }),
  ]

};

module.exports = config;
