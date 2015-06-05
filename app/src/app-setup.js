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
  'ngTable',
  'nvd3ChartDirectives',
  'ngBootstrap',
  'jsplumb',
  'ui',
  'ui.router',
  'ui.router.extras',
  'lodash',
  'core/configuration',
  'core/adblock/index',
  'core/queries/index',
  'core/goals/index',
  'core/scenarios/index',
  'core/keywords/index',
  'core/creatives/index',
  'core/adgroups/index',
  'core/usergroups/index',
  'core/campaigns/index',
  'core/placementlists/index',
  'core/login/index',
  'core/password/index',
  'core/datamart/index',
  'core/layout/index',
  'core/settings/index',
  'navigator',
  'plugins'
], function () {
  'use strict';

  var appModuleDependencies = ['navigator'];
  if (typeof localStorage.plugins !== 'undefined') {
    var pluginsInfo = JSON.parse(localStorage.plugins);
    for (var i = 0; i < pluginsInfo.length; ++i) {
      appModuleDependencies.push(pluginsInfo[i].name)
    }
  }
  return angular.module('app', appModuleDependencies);
});