define(['./module'], function (module) {
  'use strict';

  var adRoutes = {
    DISPLAY_AD: "display_ads",
    VIDEO_AD: "video_ads",
    EMAIL_TEMPLATE: "email_templates"
  };

  /**
   * Fetch the renderer properties for a given ad id and transform it into a hash
   * technical_name => {value/property_type}
   * @param {Restangular} Restangular the Restangular object (yay dependency injection...)
   * @param {$q} $q the $q object (yay dependency injection...)
   * @param {String} adId the id of the display ad.
   * @param {String} route (see route object).
   * @return {$q.promise} the promise of the result.
   */
  function fetchRendererProperties(Restangular, $q, adId, route) {
    return Restangular
      .one(route, adId)
      .all("renderer_properties")
      .getList()
      .then(function (properties) {
        var deferred = $q.defer();
        var result = {};
        for (var i = 0; i < properties.length; i++) {
          var p = properties[i];
          result[p.technical_name] = {value: p.value, property_type: p.property_type};
        }
        deferred.resolve(result);
        return deferred.promise;
      });
  }

  module.directive('creativeThumbnail', ["Restangular", 'core/configuration',
    function (Restangular, configuration) {
      return {
        link: function (scope, element, attrs) {
          scope.$watch(attrs.creativeThumbnail, function (value) {
            if (!value) {
              return;
            }
            Restangular.one("creatives", value).one("thumbnail").get().then(
              function (creative) {
                var format = scope.$eval(attrs.creativeFormat);

                if (creative.asset_path) {
                  attrs.$set("src", configuration.ASSETS_URL + creative.asset_path);
                } else if (creative.icon_id === "flash") {
                  if (format) {
                    attrs.$set("src", "images/flash/generated/Adobe-swf_icon_" + format + ".png");
                  } else {
                    attrs.$set("src", "images/flash/Adobe-swf_icon.png");
                  }
                } else if (creative.url) {
                  attrs.$set("src", creative.url);
                } else {
                  // TODO put a better image if icon_id === "image" ?
                  attrs.$set("src", "images/Unknown_file.png");
                }

              }
            ).catch(
              function (error) {
                attrs.$set("src", "images/Unknown_file.png");
              }
            );
          });
        }
      };
    }
  ]);

  module.directive('fetchAdRendererProperties', [
    "Restangular", "$q", "core/common/ads/AdService",
    function (Restangular, $q, AdService) {
      return {
        restrict: 'EA',
        controller: [
          "$scope",
          function ($scope) {
            this.setup = function (fetchAdRendererProperties) {
              var match = fetchAdRendererProperties.match(/^\s*(.+)\s+as\s+(.*?)\s*$/);
              var creativeIdExpr = match[1];
              var exposedVar = match[2];
              $scope.$watch(creativeIdExpr, function (newValue, oldValue, scope) {
                var adRoute = adRoutes.DISPLAY_AD;
                if (!newValue) {
                  return;
                } else if (AdService.getSelectedAdType() === AdService.getAdTypes().VIDEO_AD) {
                  adRoute = adRoutes.VIDEO_AD;
                }
                fetchRendererProperties(Restangular, $q, newValue, adRoute).then(function (result) {
                  $scope[exposedVar] = result;
                });
              });
            };
          }
        ],
        link: function (scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchAdRendererProperties);
        }
      };
    }
  ]);

  module.directive('fetchCreative', [
    "Restangular", "$q", "$log", "core/common/ads/AdService",
    function (Restangular, $q, $log, AdService) {
      return {
        restrict: 'EA',
        controller: ["$scope", function ($scope) {
          this.setup = function (fetchCreative) {
            var match = fetchCreative.match(/^\s*(.+)\s+as\s+(.*?)\s*(with\s*(.*))?$/);
            var creativeIdExpr = match[1];
            var exposedVar = match[2];
            var withRendererProperties = match[4] === "rendererProperties";
            $scope.$watch(creativeIdExpr, function (newValue, oldValue, scope) {
              if (!newValue) {
                return;
              }
              Restangular.one("creatives", newValue).get().then(function (creative) {
                $scope[exposedVar] = creative;
                if (withRendererProperties) {
                  var adRoute = adRoutes.DISPLAY_AD;
                  switch (creative.type) {
                    case AdService.getAdTypes().VIDEO_AD:
                      adRoute = adRoutes.VIDEO_AD;
                      break;
                    case AdService.getAdTypes().DISPLAY_AD:
                      adRoute = adRoutes.DISPLAY_AD;
                      break;
                    case AdService.getAdTypes().EMAIL_TEMPLATE:
                      adRoute = adRoutes.EMAIL_TEMPLATE;
                      break;
                    default: break;

                  }
                  fetchRendererProperties(Restangular, $q, newValue, adRoute).then(function (result) {
                    $scope[exposedVar + "Properties"] = result;
                  });
                }
              });
            });
          };
        }
        ],
        link: function (scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchCreative);
        }
      };
    }
  ]);

  module.filter('rendererProperty', function () {
    return function (input) {
      if (input === undefined) {
        return;
      }
      if (input.property_type === 'URL') {
        return input.value.url;
      }
      return "";
    };
  });
});
