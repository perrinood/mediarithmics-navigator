define(['./module'], function (module) {
  'use strict';

  // Pixel property
  module.directive('mcsPixelProperty', [
    function () {
      return {
        restrict: 'E',
        scope: {
          labelText: "@",
          labelFor: '@',
          property: '=',
          ngDisabled: '='
        },
        templateUrl: '/angular/src/core/common/properties/pixel-property.html',
        link: function (scope, element, attrs) {

          scope.$watch("property", function () {
//            console.log(scope.property);
          });
        }
      };
    }
  ]);

  // Url property
  module.directive('mcsUrlProperty', [
    function () {
      return {
        restrict: 'E',
        scope: {
          labelText: "@",
          labelFor: '@',
          property: '=',
          ngDisabled: '='
        },
        templateUrl: '/angular/src/core/common/properties/url-property.html',
        link: function (scope, element, attrs) {

          scope.$watch("property", function () {
//            console.log(scope.property);
          });
        }
      };
    }
  ]);

  // Text property
  module.directive('mcsTextProperty', [
    function () {
      return {
        restrict: 'E',
        scope: {
          labelText: "@",
          labelFor: '@',
          property: '=',
          ngDisabled: '='
        },
        templateUrl: '/angular/src/core/common/properties/text-property.html',
        link: function (scope, element, attrs) {
        }
      };
    }
  ]);

  // Recommender property
  module.directive('mcsRecommenderProperty', [
    function () {
      return {
        restrict: 'E',
        scope: {
          labelText: "@",
          labelFor: '@',
          property: '=',
          ngDisabled: '='
        },
        templateUrl: '/angular/src/core/common/properties/recommender-property.html',
        link: function (scope, element, attrs) {
        }
      };
    }
  ]);


  // Ad Layout property
  module.directive('mcsAdLayoutProperty', ['Restangular', '$uibModal', '$log',
    function (Restangular, $uibModal, $log) {
      return {
        restrict: 'E',
        scope: {
          labelText: "@",
          labelFor: '@',
          property: '=',
          organisationId: '=',
          ngDisabled: '=',
          pluginId: '=',
          pluginVersionId: '='
        },
        templateUrl: '/angular/src/core/common/properties/ad-layout-property.html',
        link: function (scope, element, attrs) {

          if (typeof scope.organisationId === 'undefined') {
            return $log.warn("mcsAdLayoutProperty: Missing organisation id");
          }

          if (typeof scope.property === 'undefined') {
            return $log.warn("mcsAdLayoutProperty: Property is undefined");
          }

          scope.selectedAdLayout = {};

          Restangular.one("plugins/" + scope.pluginId + "/versions/" + scope.pluginVersionId).get().then(function (version) {
            scope.displayAdRenderer = {versionId: version.id, artifactId: version.artifact_id, groupId: version.group_id, version: version.version_id};
          });

          if (scope.property.value.id) {
            Restangular.one("ad_layouts/" + scope.property.value.id).get({organisation_id: scope.organisationId}).then(function (adLayout) {
              Restangular.one("ad_layouts/" + scope.property.value.id + "/versions/" + scope.property.value.version)
                .get({organisation_id: scope.organisationId}).then(function (version) {
                  scope.selectedAdLayout = {adLayout: adLayout, version: version};
                });
            });
          }


          scope.$watch('selectedAdLayout', function (selected) {
            if (selected && selected.adLayout) {
              Restangular.one("plugins/" + selected.adLayout.renderer_id + "/versions/" + selected.adLayout.renderer_version_id).get().then(function (version) {
                scope.rendererVersion = version;
              });
            }
          });

          scope.selectAdLayout = function () {
            var modal = $uibModal.open({
              templateUrl: 'angular/src/core/common/properties/ad-layout-select.html',
              scope: scope,
              backdrop: 'static',
              controller: 'core/common/properties/AdLayoutSelectController',
              size: 'lg',
              resolve: {
                propAdLayout: function () {
                  return scope.property.value;
                },
                displayAdRenderer: function () {
                  return scope.displayAdRenderer;
                }
              }
            });
            modal.result.then(function (selectedAdLayout) {
              if (selectedAdLayout) {
                scope.selectedAdLayout = selectedAdLayout;
                scope.property.value.id = selectedAdLayout.adLayout.id;
                scope.property.value.version = selectedAdLayout.version.id;
              }
            });
          };
        }
      };
    }
  ]);

  // Style Sheet Property
  module.directive('mcsStyleSheetProperty', ['Restangular', '$uibModal', '$log',
    function (Restangular, $uibModal, $log) {
      return {
        restrict: 'E',
        scope: {
          labelText: "@",
          labelFor: '@',
          property: '=',
          organisationId: '=',
          ngDisabled: '='
        },
        templateUrl: '/angular/src/core/common/properties/style-sheet-property.html',
        link: function (scope, element, attrs) {
          scope.selectedStyleSheet = {};

          if (scope.property.value.id) {
            Restangular.one("style_sheets/" + scope.property.value.id).get({organisation_id: scope.organisationId}).then(function (styleSheet) {
              Restangular.one("style_sheets/" + scope.property.value.id + "/versions/" + scope.property.value.version)
                .get({organisation_id: scope.organisationId}).then(function (version) {
                  scope.selectedStyleSheet = {styleSheet: styleSheet, version: version};
                });
            });
          }

          if (typeof scope.organisationId === 'undefined') {
            return $log.warn("mcsStyleSheetProperty: Missing organisation id");
          }

          if (typeof scope.property === 'undefined') {
            return $log.warn("mcsStyleSheetProperty: Property is undefined");
          }

          scope.selectStyleSheet = function () {
            var modal = $uibModal.open({
              templateUrl: 'angular/src/core/common/properties/style-sheet-select.html',
              scope: scope,
              backdrop: 'static',
              controller: 'core/common/properties/StyleSheetSelectController',
              size: 'lg',
              resolve: {
                propStyleSheet: function () {
                  return scope.property.value;
                }
              }
            });
            modal.result.then(function (selectedStyleSheet) {
              if (selectedStyleSheet) {
                scope.selectedStyleSheet = selectedStyleSheet;
                scope.property.value.id = selectedStyleSheet.styleSheet.id;
                scope.property.value.version = selectedStyleSheet.version.id;
              }
            });
          };
        }
      };
    }
  ]);

  // Number property
  module.directive('mcsNumberProperty', [
    function () {
      return {
        restrict: 'E',
        scope: {
          labelText: "@",
          labelFor: '@',
          property: '=',
          ngDisabled: '='
        },
        templateUrl: '/angular/src/core/common/properties/number-property.html',
        link: function (scope, element, attrs) {
        }
      };
    }
  ]);

  // asset property
  module.directive('mcsAssetProperty', [
    function () {
      return {
        restrict: 'E',
        scope: {
          labelText: '@',
          labelFor: '@',
          property: '=',
          ngDisabled: '='
        },
        controller: 'core/common/properties/AssetPropertyController',
        templateUrl: '/angular/src/core/common/properties/asset-property.html',
        link: function (scope, element, attrs) {

          scope.$watch("property", function () {
//            console.log(scope.property);
          });
        }
      };
    }
  ]);

  // data file property
  module.directive('mcsDataFileProperty', ['core/common/auth/AuthenticationService','Restangular','$window','$location',"core/common/WaitingService","core/configuration",
    function (AuthenticationService,Restangular, $window,$location,waitingService, configuration) {
      return {
        restrict: 'E',
        scope: {
          labelText: '@',
          labelFor: '@',
          property: '=',
          ngDisabled: '='
        },
        templateUrl: '/angular/src/core/common/properties/data-file-property.html',
        link: function (scope, element, attrs) {

          scope.micsPlUpload = {
            multi_selection: false,
            url: $location.protocol() + ":" + Restangular.one("data_file").one("data").getRestangularUrl()+ "?uri=" + encodeURIComponent(scope.property.value.uri),
            http_method: "PUT",
            multipart: false,
            filters: {
              max_file_size: "2500kb"
            },
            init: {
              FileUploaded: function () {
                waitingService.hideWaitingModal();
              },
              FilesAdded: function () {
                waitingService.showWaitingModal();
                scope.uploadError = null;
                scope.$apply();
              },
              Error: function (up, err) {
                waitingService.hideWaitingModal();
                scope.uploadError = err.message;
                scope.$apply();
              }
            }
          };

          scope.$watch("property.value.uri", function () {
           scope.micsPlUpload.url = $location.protocol() + ":" + Restangular.one("data_file").one("data").getRestangularUrl()+ "?uri=" + encodeURIComponent(scope.property.value.uri);
          });

          scope.isNotValid = function(uri){
            return (uri || "").substring(0, 7) !== "mics://";
          };

          scope.download = function(uri){
            if (! scope.isNotValid(uri)){
              var dlUrl = Restangular.one("data_file").one("data").getRestangularUrl()+ "?uri=" + encodeURIComponent(uri) + "&access_token=" + encodeURIComponent(AuthenticationService.getAccessToken());
              $window.location = dlUrl;
            }
          };
        }
      };
    }
  ]);

// double property
  module.directive('mcsDoubleProperty', [
    function () {
      return {
        restrict: 'E',
        scope: {
          labelText: '@',
          labelFor: '@',
          property: '=',
          ngDisabled: '='
        },
        templateUrl: '/angular/src/core/common/properties/double-property.html',
        link: function (scope, element, attrs) {

          scope.$watch("property", function () {
          });
        }
      };
    }
  ]);


// boolean property
  module.directive('mcsBooleanProperty', [
    function () {
      return {
        restrict: 'E',
        scope: {
          labelText: '@',
          labelFor: '@',
          property: '=',
          ngDisabled: '='
        },
        templateUrl: '/angular/src/core/common/properties/boolean-property.html',
        link: function (scope, element, attrs) {
          scope.options =[{value: true},{value:false}];
          scope.$watch("property", function () {

          });
        }
      };
    }
  ]);

});
