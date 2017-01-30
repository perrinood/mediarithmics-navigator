define(['./module'], function (module) {

  'use strict';


  module.controller('core/datamart/monitoring/ViewAllController', [
    '$scope', 'core/common/auth/Session',
    function($scope, Session) {

      if (Session.cookies && Session.cookies.mics_vid){
        $scope.myTimelineHref = "#" + Session.getWorkspacePrefixUrl() + "/datamart/users/user_agent_id/vec:" + Session.cookies.mics_vid + "?live=true";
      }

    }
  ]);

});
