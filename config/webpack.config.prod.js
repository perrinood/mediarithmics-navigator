const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');

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
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appDistHtml,
      filename: '../index.html'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true, // React doesn't support IE8
        warnings: false
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: true,
        screw_ie8: true
      }
    }),
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: {
        discardComments: {
          removeAll: true,
        },
        // Run cssnano in safe mode to avoid
        // potentially unsafe transformations.
        safe: true
      },
      canPrint: false,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
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
