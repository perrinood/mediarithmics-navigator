define(['./module', 'moment-duration-format'], function (module) {

  'use strict';


  module.controller('core/datamart/users/ViewOneController', [
    '$scope', '$stateParams', 'Restangular', 'core/datamart/common/Common', 'jquery', 'core/common/auth/Session',
    'lodash', 'moment', '$log', '$location',
    function ($scope, $stateParams, Restangular, Common, $, Session, lodash, moment, $log, $location) {

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

      if ($stateParams.property){
        $scope.userEndpoint.customGETLIST('user_timelines/' + $stateParams.property + '=' + $stateParams.value + '/user_activities', options).then(function (timelines) {
          $scope.timelines = timelines;
        });
      } else {
        $scope.userEndpoint.customGETLIST('user_timelines/' + $stateParams.userPointId + '/user_activities', options).then(function (timelines) {
          $scope.timelines = timelines;
        });
      }


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

      $scope.showMore = false;
      $scope.loadMoreActions = function () {
        $scope.showMore = false;

      };


    }
  ]);

});
