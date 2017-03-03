const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const paths = require('./paths');
const configFactory = require('./webpack.config');

const customFontPath = `${paths.public}/src/assets/fonts/`;

const prodConfig = {

  output: {
    filename: '[name].[chunkhash].js',
    path: paths.appDistPath,
    publicPath: paths.publicDistPath
  },

  plugins: [
    new ExtractTextPlugin('style.[chunkhash].css'),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appDistHtml,
      filename: '../index.html'
    }),
    new CopyWebpackPlugin([
      {
        from: 'app/react/src/assets',
        to: 'src/assets'
      }
    ])
  ]

};

module.exports = merge(configFactory(customFontPath, true), prodConfig);
