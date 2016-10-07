define(['./module', 'moment-duration-format'], function (module) {

  'use strict';


  module.controller('core/datamart/users/ViewOneController', [
    '$scope', '$stateParams', 'Restangular', 'core/datamart/common/Common', 'jquery', 'core/common/auth/Session',
    'lodash', 'moment', '$log', '$location', '$q',
    function ($scope, $stateParams, Restangular, Common, $, Session, lodash, moment, $log, $location, $q) {

      $scope.INITIAL_VISITS = 10;

      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.organisationId = $stateParams.organisation_id;
      $scope.debug = $stateParams.debug;

      $scope.activities = [];
      $scope.userEndpoint = Restangular.one('datamarts', $scope.datamartId);

      $scope.toggle = {showPlatform:false};

      var options = {};
      if ($stateParams.activity_type){

        if ($stateParams.activity_type === 'ALL') {
          $scope.toggle = {showPlatform:true};
        }

        options = {live: $stateParams.live === "true", type: $stateParams.activity_type};
      } else {
        options = {live: $stateParams.live === "true"};
      }

      var userTimelinesUrl;

      if ($stateParams.property) {
        userTimelinesUrl = $stateParams.property + '=' + $stateParams.value;
      } else {
        userTimelinesUrl = $stateParams.userPointId;
      }

      function scopeTimelines(timelines) {
        $scope.timelines = timelines;
      }

      function retrieveSiteIdFromTimelines() {

        var sitesId = $scope.timelines.reduce(function (acc, next) {
          var nextSiteId = next['$site_id'];
          return nextSiteId && (acc.indexOf(nextSiteId) === -1) ? acc.concat(nextSiteId) : acc;
        }, []);

        var promises = sitesId.map(function (siteId) {
          return Restangular.one("datamarts/" + $scope.datamartId + "/sites/" + siteId).get();
        });

        function scopeSitesandDevicesWithTimelines(sites) {
          $scope.timelines.forEach(function (timeline) {
            timeline.site = lodash.find(sites, function (site) {
              return site.id === timeline['$site_id'];
            });

            var userAgent = lodash.find($scope.devices, function (userAgent) {
              return userAgent.vector_id === timeline['$user_agent_id'];
            });

            if (userAgent) {
              timeline.formFactor = userAgent.device.form_factor;
            }

          });
        }

        $q.all(promises).then(scopeSitesandDevicesWithTimelines)

      }

      function waitForDevices() {

        var deferred = $q.defer();

        $scope.$watch('devices', function (newValue, oldValue) {
          if (newValue) {
            deferred.resolve();
          }
        });

        return deferred.promise;
        
      }

      $scope.userEndpoint.customGETLIST('user_timelines/' + userTimelinesUrl + '/user_activities', options)
        .then(scopeTimelines)
        .then(waitForDevices)
        .then(retrieveSiteIdFromTimelines)


      $scope.$watch('toggle.showPlatform',function(newValue, oldValue){
        if (newValue !== oldValue){
          if (newValue){
            $location.search('activity_type', 'ALL');
          } else {
            $location.search('activity_type', null);
          }
        }
      });

      if ($stateParams.property) {
        $scope.userEndpoint.customGET('user_profiles/' + $stateParams.property + '=' + $stateParams.value).then(function (user) {
          $scope.user = Restangular.stripRestangular(user);
        });

      } else {
        $scope.userEndpoint.one('user_profiles', $stateParams.userPointId).get().then(function (user) {
          $scope.user = Restangular.stripRestangular(user);
        });
      }

      $scope.audienceSegments = {};
      function fetchAudienceSegment(segmentId){
        Restangular.one('audience_segments', segmentId).get().then(function (audienceSegment) {
          $scope.audienceSegments[segmentId] = audienceSegment;
         });
      }

      if ($stateParams.property) {
        $scope.userEndpoint.customGET('user_segments/' + $stateParams.property + '=' + $stateParams.value).then(function (segments) {
          $scope.segments = segments;

          for (var segmentIdx = 0; segmentIdx < $scope.segments.length; segmentIdx++) {
            fetchAudienceSegment($scope.segments[segmentIdx].segment_id);
          }
        });

      } else {
      $scope.userEndpoint.one('user_segments', $stateParams.userPointId).getList().then(function (segments) {

        $scope.segments = segments;

        for (var segmentIdx = 0; segmentIdx < $scope.segments.length; segmentIdx++) {
          fetchAudienceSegment($scope.segments[segmentIdx].segment_id);
        }

      });
      }



      /**
       * User Identifiers
       */

      if ($stateParams.property) {
        $scope.userEndpoint.customGET('user_identifiers/' + $stateParams.property + '=' + $stateParams.value).then(function (userIdentifiers) {

          $scope.userIdentifiers = userIdentifiers;
          $scope.userAccountId = lodash.find($scope.userIdentifiers,function(userIdentifier){
            return userIdentifier.type  === 'USER_ACCOUNT';
          });


          $scope.userPoint = lodash.find($scope.userIdentifiers,function(userIdentifier){
            return userIdentifier.type  === 'USER_POINT';
          });

          $scope.emails = lodash.find($scope.userIdentifiers,function(userIdentifier){
            return userIdentifier.type  === 'USER_EMAIL';
          });

          $scope.devices = lodash.filter($scope.userIdentifiers,function(userIdentifier){
            return userIdentifier.type  === 'USER_AGENT';
          });
        });

      } else {
      $scope.userEndpoint.one('user_identifiers', $stateParams.userPointId).getList().then(function (userIdentifiers) {


        $scope.userIdentifiers = userIdentifiers;


        //$scope.userIdentifiers = userIdentifiers;
        $scope.userAccountId = lodash.find(userIdentifiers ,function(userIdentifier){
          return userIdentifier.type  === 'USER_ACCOUNT';
        });

        $scope.userPoint = lodash.find(userIdentifiers ,function(userIdentifier){
          return userIdentifier.type  === 'USER_POINT';
        });

        $scope.emails = lodash.find(userIdentifiers, function(userIdentifier){
          return userIdentifier.type  === 'USER_EMAIL';
        });

        $scope.devices = lodash.filter(userIdentifiers ,function(userIdentifier){
          return userIdentifier.type  === 'USER_AGENT';
        });



      });
      }






      /*
       TODO: actually,the loadMoreActions function just hides the load more button one the timeline view,because
       we load all the timeline in the first call (getAgentsAndVisits). we can rewrite this function when we implement the function to load
       just a part of the timeline
       */

      $scope.showMore = false;
      $scope.loadMoreActions = function () {
        $scope.showMore = false;

      };


    }
  ]);

});
