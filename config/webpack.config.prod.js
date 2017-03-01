const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const paths = require('./paths');
const config = require('./webpack.config');

const prodConfig = {

  output: {
    filename: '[name].[chunkhash].js',
    path: paths.appDistPath,
    publicPath: paths.publicDistPath
  },

  plugins: [
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

module.exports = merge(config, prodConfig);
