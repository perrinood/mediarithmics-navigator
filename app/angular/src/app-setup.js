
define([
  'angularAMD',
  'ngload',
  'moment',
  'jqCookie',
  'jqDaterangepicker',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'restangular',
  'ngSanitize',
  'ngAnimate',
  'ngTable',
  'ngBootstrap',
  'ui',
  'ui.router',
  'ui.router.extras',
  'ace',
  'ui.ace',
  'lodash',
  'js-xlsx',
  'clipboard',
  'angular-nvd3',
  'bootstrap-tokenfield',
  'core/configuration',
  'core/common/index',
  'core/adblock/index',
  'core/adlayouts/index',
  'core/assets/index',
  'core/exports/index',
  'core/bidOptimizer/index',
  'core/attributionmodels/index',
  'core/visitanalysers/index',
  'core/goals/index',
  'core/scenarios/index',
  'core/keywords/index',
  'core/creatives/index',
  'core/adgroups/index',
  'core/campaigns/index',
  'core/placementlists/index',
  'core/login/index',
  'core/password/index',
  'core/datamart/index',
  'core/layout/index',
  'core/settings/index',
  'core/stylesheets/index',
  'optional-plugin',
  'navigator',
  'plugins'
], function () {
  'use strict';

  var appModuleDependencies = ['navigator'];
  if (localStorage.plugins) {
    var pluginsInfo = JSON.parse(localStorage.plugins);
    for (var i = 0; i < pluginsInfo.length; ++i) {
      var plugin = window.PLUGINS_CONFIGURATION[pluginsInfo[i].name];
      if (plugin && plugin.isLoaded) {
        appModuleDependencies.push(pluginsInfo[i].name);
      }
    }
  }
  return angular.module('app', appModuleDependencies);
});
