define(['./module'], function (module) {
  'use strict';

  module.directive('micsDatamartGrid', ['core/datamart/common/Common', '$location', 'Restangular', function (Common, $location) {
    return {
      restrict: 'A',
      scope: {
        // template for rendering the list
        template: '=',
        // template for rendering an element
        elementTemplate: '=',
        // element data to bind to
        data: '=',
        // callback that refreshes data based on paging information
        refresh: '=',
        // links to individual elements are prefixed with this
        urlPrefix: '=',
        // page size
        pageSize: '='
      },
      link: function (scope, element, attrs) {

        scope.getTemplate = function () {
          if (scope.template) {
            return scope.template;
          } else {
            return 'src/core/datamart/common/default-grid.template.html';
          }
        };

        scope.showItem = function (itemId) {
          $location.path(scope.urlPrefix + '/' + itemId);
        };

        scope.getElementTemplate = function () {
          if (scope.elementTemplate) {
            return scope.elementTemplate;
          } else {
            return 'src/core/datamart/common/default-grid-element.template.html';
          }
        };

        // init paging
        scope.pageCount = 0;
        scope.currentPage = 0;
        scope.currentOffset = 0;
        scope.elementsPerPage = (scope.pageSize) ? scope.pageSize : 10;

        scope.generatePaging = function () {
          var pages = [];
          for (var i = 0; i <= scope.pageCount; i++) {
            pages.push(i);
          }
          return pages;
        };

        var updatePageCount = function () {
          var pc = 0;
          // calculate page count
          if (scope.data && scope.data.metadata && scope.data.metadata.paging) {
            pc = Math.min(Math.floor(scope.data.metadata.paging.count / scope.elementsPerPage), 9);
            // if offset changed in the meantime (from the data provider's side, for.ex term based search), reset the current page to 0
            if (scope.data.metadata.paging.first_result !== scope.currentOffset && scope.currentPage !== 0) {
              scope.currentPage = 0;
            }
          }
          // if it changed, push to scope and reset current page to 0
          if (scope.pageCount !== pc) {
            scope.pageCount = pc;
            scope.currentPage = 0;
          }
        };

        scope.previousPage = function () {
          if (scope.currentPage > 0) {
            scope.currentPage--;
            callDataRefresh();
          }
        };

        scope.nextPage = function () {
          if (scope.currentPage < scope.pageCount) {
            scope.currentPage++;
            callDataRefresh();
          }
        };

        scope.setPageTo = function () {
          scope.currentPage = this.page;
          callDataRefresh();
        };

        scope.languageMapping = Common.languageMapping;

        var callDataRefresh = function () {
          // call the provided callback with the offset and limit calculated
          scope.currentOffset = scope.currentPage * scope.elementsPerPage;
          // this triggers the data change, which in turn regenerates the paging
          scope.refresh(scope.currentOffset, scope.elementsPerPage);
        };

        // attach watcher to data and update the pageCount
        scope.$watch('data', updatePageCount);

      },
      template: '<div ng-include="getTemplate()"></div>'
    };
  }]);

});
