define(['./module'], function (module) {
  'use strict';

  module.directive("jsAutoHideActions", [
    "jquery",
    function ($) {
    return {
      restrict: 'C', // class name
      link: function(scope, element, attrs) {
        element.on("mouseenter", "tr", function() {
          var $this = $(this);
          var rowPosition = $this.position();
          var rowHeight = $this.height();

          var $overlay = $this.find("td.actions");

          var css = {
            display: "table-cell",
            position: "absolute",
            top: rowPosition.top,
            height: rowHeight,
            // TODO this is half of our custom gutter. Currently, all our tables with this feature are
            // full page tables, with the gutter on the right.
            // Why not calculate the offset ? Because the overlay is a position:absolute and the main
            // block is a position:relative. The browser uses the main block as reference for the `right`
            // property, not the right border of the screen (and we have a left pane).
            // Why not a position:relative and calculate from the end of the table ? Because in that case
            // the td is used by the browser to calculate the tr width and everything explode...
            right: "50px"
          };

          $overlay.css(css);
        });

        element.on("mouseleave", "tr", function() {
          var $this = $(this);
          var $overlay = $this.find("td.actions");

          $overlay.css({
            display: "none"
          });
        });
      }
    };
  }
  ]);
});

