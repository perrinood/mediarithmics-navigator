define(['./module'], function (module) {

  'use strict';

  module.controller('core/placementlists/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService",
    function ($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService) {
      var placementListId = $stateParams.placementlist_id;
      var type = $stateParams.type;

      $scope.isCreationMode = !placementListId;

      // TODO find placement lists with multiple descriptor_types / holders
      $scope.webPlacementListParams = new NgTableParams({
        page: 1,            // show first page
        count: 10           // count per page
      }, {
        total: 0,           // length of data
        getData: function ($defer, params) {
          Restangular.one('placement_lists', placementListId).all('placement_descriptors').getList({
            descriptor_type: "PATTERN",
            first_result: (params.page() - 1) * params.count(),
            max_results: params.count()
          }).then(function (descriptors) {
            // update table params
            params.total(descriptors.metadata.paging.count);
            // set new data
            $defer.resolve(descriptors);
          });
        }
      });

      $scope.appPlacementListParams = new NgTableParams({
        page: 1,            // show first page
        count: 10           // count per page
      }, {
        total: 0,           // length of data
        getData: function ($defer, params) {
          Restangular.one('placement_lists', placementListId).all('placement_descriptors').getList({
            descriptor_type: "EXACT_APPLICATION_ID",
            placement_holder: "APPLICATION",
            first_result: (params.page() - 1) * params.count(),
            max_results: params.count()
          }).then(function (descriptors) {
            // update table params
            params.total(descriptors.metadata.paging.count);
            // set new data
            $defer.resolve(descriptors);
          });
        }
      });

      if (!placementListId) {
        $scope.placementList = {
          group_type: type
        };
      } else {
        Restangular.one('placement_lists', placementListId).get().then(function (placementList) {
          $scope.placementList = placementList;
        });
      }
      $scope.pluploadOptions = {
        multi_selection: true,
        url: $location.protocol() + ":" + Restangular.one('placement_lists', placementListId).one("placement_descriptors").one("batch").getRestangularUrl(),
        filters: {
          mime_types: [
            {title: "CSV files", extensions: "csv,txt"}
          ],
          max_file_size: "2500kb"
        },
        init: {
          FileUploaded: function () {
            $scope.webPlacementListParams.reload();
            waitingService.hideWaitingModal();
          },
          FilesAdded: function () {
            waitingService.showWaitingModal();
            $scope.uploadError = null;
            $scope.$apply();
          },
          Error: function (up, err) {
            waitingService.hideWaitingModal();
            $scope.uploadError = err.message;
            $scope.$apply();
          }
        }
      };

      $scope.addPlacement = function (placementType) {
        // switch (placementType) {
        //   case "EXACT_URL":
        //     Restangular.all('placement_lists').post($scope.placementList, {organisation_id: Session.getCurrentWorkspace().organisation_id});
        //     break;
        //   case "EXACT_APPLICATION_ID":
        //     Restangular.all('placement_lists').post($scope.placementList, {organisation_id: Session.getCurrentWorkspace().organisation_id});
        //     break;
        //   default:
        //     $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/display");
        //     break;
        // }
      };

      $scope.goToCampaign = function (campaign) {
        switch (campaign.type) {
          case "DISPLAY":
            $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/display/report/" + campaign.id + "/basic");
            break;
          default:
            $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/display");
            break;
        }
      };

      $scope.downloadCSV = function () {
        $window.location = Restangular.one('placement_lists', placementListId).one("placement_descriptors").one("csv").getRestangularUrl() + "?access_token=" + encodeURIComponent(AuthenticationService.getAccessToken());
      };

      $scope.deletePlacement = function (placement) {
        placement.remove({organisation_id: Session.getCurrentWorkspace().organisation_id}).then(function () {
          $scope.webPlacementListParams.reload();
        });
      };

      $scope.editPlacement = function (placement) {
      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/library/placementlists");
      };

      $scope.next = function () {
        var promise = null;
        if (placementListId) {
          promise = $scope.placementList.put();
        } else {
          promise = Restangular.all('placement_lists').post($scope.placementList, {organisation_id: Session.getCurrentWorkspace().organisation_id});
        }
        promise.then(function success(campaignContainer) {
          $log.info("success");
          $location.path(Session.getWorkspacePrefixUrl() + "/library/placementlists");
        }, function failure() {
          $log.info("failure");
        });
      };
    }
  ]);
});

