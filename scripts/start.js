/* eslint-disable no-console */

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const config = require('../config/webpack.config.dev');

const port = process.env.PORT || 3000;

function runDevServer() {

  const compiler = webpack(config);
  const devServer = new WebpackDevServer(compiler, {
    historyApiFallback: {
      index: '/v2'
    },
    hot: true,
    quiet: true,
    publicPath: config.output.publicPath,
    watchOptions: {
      ignored: /node_modules/
    }
  });

  devServer.listen(port, (err) => {

    if (err) {
      console.log(err);
    }

    console.log(`Starting the dev server at port ${port}`);

  });

}


runDevServer();
