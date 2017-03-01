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
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            query: {
              name: '[name].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            query: {
              bypassOnDebug: true,
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 7,
              }
            }
          }
        ]
      },
      {
        test: /\.(eot|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        use: 'url-loader'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      PUBLIC_PATH: JSON.stringify('react')
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['react-vendors', 'manifest']
    })
  ]

};

module.exports = config;
