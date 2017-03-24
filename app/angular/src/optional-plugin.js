define([], {
  load: function (moduleName, parentRequire, onload, config) {
    "use strict";

    var onLoadSuccess = function (moduleInstance) {
      // Module successfully loaded, call the onload callback so that
      // RequireJS can work its internal magic.
      onload(moduleInstance);
    };

    var onLoadFailure = function (err) {
      // Optional module failed to load.
      var failedId = err.requireModules && err.requireModules[0];
      window.console.warn("Plugin '" + window.PLUGINS_TO_REQUIRE[failedId] + "' couldn't be loaded:", err);
      window.PLUGINS_CONFIGURATION[window.PLUGINS_TO_REQUIRE[failedId]].isLoaded = false;
      window.PLUGINS_CONFIGURATION[window.PLUGINS_TO_REQUIRE[failedId]].loadFailed = true;

      // Undefine the module to cleanup internal stuff in requireJS
      requirejs.undef(failedId);

      // Now define the module instance as a simple empty object
      // (NOTE: you can return any other value you want here)
      define(failedId, [], function () {
        return false;
      });

      // Now require the module make sure that requireJS thinks
      // that is it loaded. Since we've just defined it, RequireJS
      // will not attempt to download any more script files and
      // will just call the onLoadSuccess handler immediately.
      parentRequire([failedId], onLoadSuccess);
    };

    parentRequire([moduleName], onLoadSuccess, onLoadFailure);
  }
});
