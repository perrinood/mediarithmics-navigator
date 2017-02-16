const webpack = require('webpack');
const merge = require('webpack-merge');

const config = require('./webpack.config');

const devConfig = {

  devtool: 'eval',

  output: {
    filename: '[name].js'
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]

};

module.exports = merge(config, devConfig);
