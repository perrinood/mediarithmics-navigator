/* global videojs */
define(['./module'], function (module) {
  'use strict';

  module.directive("micsVideo", [
    function () {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          attrs.type = attrs.type || "video/mp4";
          attrs.src = attrs.src || "http://assets.mediarithmics.com/1/public/assets/default_video.mp4";
          var setup = {
            'controls': attrs.controls || true,
            'preload': attrs.preload || 'auto',
            'height': attrs.height || '360',
            'width': attrs.width || '640'
          };

          var player = videojs(element[0], setup, function () {
            this.src({type: attrs.type, src: attrs.src});
            this.ads();
          });

          attrs.$observe('micsVideo', function (value) {
            if (value) {
              player.vast({url: value});
            }
          });

          element.on("$destroy", function () {
            player.dispose();
          });
        }
      };
    }
  ]);
});
