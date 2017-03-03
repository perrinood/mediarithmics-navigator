const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const paths = require('./paths');
const configFactory = require('./webpack.config');

const customFontPath = 'app/react/src/assets/fonts/';

const devConfig = {

  devtool: 'eval',

  output: {
    filename: '[name].js',
    path: paths.appPath,
    publicPath: paths.publicPath
  },

  plugins: [
    new ExtractTextPlugin('style.css'),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml
    }),
  ]

};

module.exports = merge(configFactory(customFontPath, false), devConfig);
