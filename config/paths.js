const path = require('path');

function resolve(relativePath) {
  return path.resolve(relativePath);
}

module.exports = {
  appHtml: resolve('app/index.html'),
  appPackageJson: resolve('package.json'),
  appSrc: resolve('app/react/src'),
  appNodeModules: resolve('node_modules'),
  public: '/v2'
};
