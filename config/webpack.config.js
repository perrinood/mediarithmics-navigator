const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const paths = require('./paths');
const babelOptions = require('./babel');
const pkg = require('../package.json');

const extractSass = new ExtractTextPlugin({
  filename: '[name].[chunkhash].css',
  disable: process.env.NODE_ENV === 'development'
});

const configFactory = (isProduction, customFontPath, eslintFailOnError) => {

  return {

    entry: {
      babel: 'babel-polyfill',
      app: path.join(paths.reactAppSrc, '/index.js'),
      style: paths.appStyle,
      'react-vendors': Object.keys(pkg.dependencies)
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          include: paths.reactAppSrc,
          use: {
            loader: 'eslint-loader',
            query: {
              failOnError: eslintFailOnError
            }
          },
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
          test: /\.scss$/,
          loader: extractSass.extract({
            use: [
              'css-loader?sourceMap',
              'resolve-url-loader',
              `sass-loader?${JSON.stringify({
                sourceMap: false,
                includePaths: [paths.appNodeModules],
                data: `$custom_font_path: '${customFontPath}';`
              })}`
            ],
            fallback: 'style-loader'
          })
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              query: {
                name: `${isProduction ? '/src/assets/images/' : ''}[name].[ext]`
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

    resolve: {
      modules: [paths.appNodeModules]
    },

    plugins: [
      extractSass,
      new webpack.DefinePlugin({
        PUBLIC_PATH: JSON.stringify('react')
      }),
      new webpack.DefinePlugin({
        PUBLIC_URL: JSON.stringify('/v2')
      }),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['react-vendors', 'manifest']
      })
    ]
  };

};

module.exports = configFactory;
