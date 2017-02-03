const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = require('./webpack.config');
const paths = require('./paths');

const devConfig = {

  devtool: 'eval',

  output: {
    filename: '[name].js'
  },

  plugins: [
    new webpack.DefinePlugin({
      PUBLIC_PATH: JSON.stringify('.')
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml
    }),
    new webpack.HotModuleReplacementPlugin()
  ]

};

module.exports = merge(config, devConfig);
