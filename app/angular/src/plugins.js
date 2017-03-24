/* jshint -W097 */
'use strict';

window.PLUGINS_TO_REQUIRE = [];

/**
 * Retrieve plugins info from local storage
 * Define all plugins and add them to the plugins module dependencies in order to link them to the navigator app
 * Plugins
 */
var pluginsDeps = ['navigator', 'optional-plugin'];
if (localStorage.plugins) {
  var definePlugin = function (pluginInfo) {
    if (window.PLUGINS_CONFIGURATION[pluginInfo.name]) {
      window.PLUGINS_CONFIGURATION[pluginInfo.name].loadFailed = false;
      if (!pluginInfo.enabled) {
        window.PLUGINS_CONFIGURATION[pluginInfo.name].isLoaded = false;
        return;
      }
      window.PLUGINS_CONFIGURATION[pluginInfo.name].isLoaded = true;
      var setupFileUrl = window.PLUGINS_CONFIGURATION[pluginInfo.name].url + '/' + pluginInfo.setupFile;
      window.PLUGINS_TO_REQUIRE[setupFileUrl] = pluginInfo.name;
      pluginsDeps.push("optional-plugin!" + setupFileUrl);
      define(pluginInfo.moduleName, ['navigator'], function () {
        var data = {};
        var pluginService = {};

        data.baseTemplateUrl = window.PLUGINS_CONFIGURATION[pluginInfo.name].url;
        data.baseUrl = pluginInfo.urn;

        pluginService.getProperties = function () {
          return data.properties;
        };

        pluginService.getBaseTemplateUrl = function () {
          return data.baseTemplateUrl;
        };

        pluginService.getBaseUrl = function () {
          return data.baseUrl;
        };

        pluginService.createState = function (name, url, template, navbar, category) {
          return {
            name: name,
            url: pluginService.getBaseUrl() + url,
            templateUrl: pluginService.getBaseTemplateUrl() + template,
            data: {
              category: category,
              navbar: pluginService.getBaseTemplateUrl() + navbar
            }
          };
        };

        pluginService.loadCss = function (template) {
          var link = document.createElement("link");
          link.type = "text/css";
          link.rel = "stylesheet";
          link.href = pluginService.getBaseTemplateUrl() + template;
          document.getElementsByTagName("head")[0].appendChild(link);
        };
        return pluginService;
      });
    }
  };

  var pluginsInfo = JSON.parse(localStorage.plugins);
  for (var i = 0; i < pluginsInfo.length; ++i) {
    definePlugin(pluginsInfo[i]);
  }
}

/**
 * RequireJS Plugins Module
 * Load plugins by calling them through require dependency retrieval function.
 * Each plugin depends on a .conf module that is generated above.
 */
define(pluginsDeps);
