define(['./module', 'moment-duration-format'], function (module) {

  'use strict';


  module.controller('core/datamart/users/ViewOneController', [
    '$scope', '$stateParams', 'Restangular', 'core/datamart/common/Common', 'jquery', 'core/common/auth/Session',
    'lodash', 'moment', '$log', '$location', '$q',
    function ($scope, $stateParams, Restangular, Common, $, Session, lodash, moment, $log, $location, $q) {

      var INITIAL_ACTIVITIES_LIMIT = 10;

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

      options.limit = INITIAL_ACTIVITIES_LIMIT;

      var userTimelinesUrl;

      if ($stateParams.property) {
        userTimelinesUrl = $stateParams.property + '=' + $stateParams.value;
      } else {
        userTimelinesUrl = $stateParams.userPointId;
      }

      $scope.timelines = [];

      function scopeTimelines(timelines) {
        $scope.timelines = $scope.timelines.concat(timelines);
        return timelines;
      }

      function retrieveSiteIdAndAppIdFromTimelines(activities) {

        var sitesOrAppsId = activities.reduce(function (acc, next) {
          var nextSiteId = (next.$site_id || next.$app_id); 
          return nextSiteId && (acc.indexOf(nextSiteId) === -1) ? acc.concat(nextSiteId) : acc;
        }, []);

        var promises = sitesOrAppsId.map(function (siteOrAppId) {
          return Restangular.one("datamarts/" + $scope.datamartId + "/channels/" + siteOrAppId).get();
        });

        function scopeSitesOrAppsAndDevicesWithTimelines(sitesOrApps) {
          activities.forEach(function (timelineActivity) {
            timelineActivity.siteOrApp = lodash.find(sitesOrApps, function (siteOrApp) {
              return siteOrApp.id === (timelineActivity.$site_id || timelineActivity.$app_id);
            });

            var userAgent = lodash.find($scope.devices, function (userAgent) {
              return userAgent.vector_id === timelineActivity.$user_agent_id;
            });

            if (userAgent) {
              timelineActivity.formFactor = userAgent.device.form_factor;
            }

          });
        }

        $q.all(promises).then(scopeSitesOrAppsAndDevicesWithTimelines);

      }

      function waitForDevices(previousPromise) {

        var deferred = $q.defer();

        $scope.$watch('devices', function (newValue, oldValue) {
          if (newValue) {
            deferred.resolve(previousPromise);
          }
        });

        return deferred.promise;
        
      }

      $scope.userEndpoint.customGETLIST('user_timelines/' + userTimelinesUrl + '/user_activities', options)
        .then(scopeTimelines)
        .then(waitForDevices)
        .then(retrieveSiteIdAndAppIdFromTimelines);


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

          $scope.emails = lodash.filter($scope.userIdentifiers,function(userIdentifier){
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

        $scope.emails = lodash.filter(userIdentifiers, function(userIdentifier){
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

      $scope.showMore = true;
      $scope.loadMoreActions = function () {
        $scope.showMore = false;

        var oldestDisplayedActivityDate = $scope.timelines[$scope.timelines.length -1].$ts;

        options.to = moment(oldestDisplayedActivityDate).format('YYYY-MM-DD');
        
        //TODO handle platform activities
        $scope.userEndpoint.customGETLIST('user_timelines/' + userTimelinesUrl + '/user_activities', options)
          .then(scopeTimelines)
          .then(retrieveSiteIdAndAppIdFromTimelines)
          .then(function(){
            $scope.showMore = true;
          });

      };


    }
  ]);

});
