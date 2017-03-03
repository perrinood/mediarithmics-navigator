const path = require('path');

function resolve(relativePath) {
  return path.resolve(relativePath);
}

module.exports = {
  appHtml: resolve('app/index.html'),
  appDistHtml: resolve('dist/index.html'),
  reactAppSrc: resolve('app/react/src'),
  appStyle: resolve('app/react/src/styles/index.scss'),
  appNodeModules: resolve('node_modules'),
  appPath: resolve('app'),
  appDistPath: resolve('dist/react'),
  publicPath: '/',
  publicDistPath: '/react'
};
