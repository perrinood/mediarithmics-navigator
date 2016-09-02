define(['./module', 'angular'], function (module, angular) {
  'use strict';

  module.directive('mcsBidOptimizerDynamicAllocationReport', [
    'core/common/auth/Session', 'Restangular', 'moment', 'ngTableParams', '$filter', '$interpolate', 'lodash', '$q', '$http',
    function (Session, Restangular, moment, NgTableParams, $filter, $interpolate, _, $q, $http) {
      return {
        restrict: 'E',
        scope: {
          report: '='
        },
        link: function link(scope, element, attrs) {
          scope.organisationId = Session.getCurrentWorkspace().organisation_id;
          scope.workspace = Session.getWorkspacePrefixUrl();
          /**
           * Cells formatting methods
           */

          var interpolatedValue = function (scope, row) {
            return row[this.field];
          };

          var formatMedia = function (scope, row) {
            return row[this.field];
          };

          var allocationRatioToPercent = function (scope, row) {
            return (row.RATIO_TO_SPEND) > 0 ? (row.RATIO_TO_SPEND * 100).toFixed(3) + '%' : '-';
          };

          /**
           * Function to call when selecting an ad group
           */
          var changeAllocation = function (environment) {

            scope.selectedEnvironment = environment;
            // the campaign value of the ad group
            scope.selectedCampaign = environment.campaign;

            var allocationTable = _.find(scope.report.$allocation_tables, function (allocationTable) {
              return allocationTable.$ad_group_id === environment.adGroup.id;
            });
            // values of the allocation table of adGroupId
            scope.allocationsData = allocationTable.$allocations.map(function (allocation) {
              allocation.$allocation_id.WEIGHTED_CONVERSIONS = allocation.$weighted_conversions;
              allocation.$allocation_id.RATIO_TO_SPEND = allocation.$ratio_to_spend;
              return allocation.$allocation_id;
            });

            function isNumeric(n) {
              return !isNaN(parseFloat(n)) && isFinite(n);
            }

            /**
             * Find the app name if it is an app
             */
            function findAppName(id) {
              var deferred = $q.defer();

              if (isNumeric(id)) {
                $http.jsonp("https://itunes.apple.com/lookup", {
                  params: {
                    'callback': 'JSON_CALLBACK',
                    'id': id
                  }
                }).success(function (data) {
                  deferred.resolve(angular.isDefined(data.results) && data.results.length ? data.results[0].trackName : id);
                }).error(function (e) {
                  deferred.resolve(id);
                });
              } else {
                // No need to look for a name if it is a site or an android app (no Google API)
                deferred.resolve(id);
              }

              return deferred.promise;
            }

            // Setup media id
            function setupMediaId() {
              scope.allocationsData.map(function (data) {
                var id = data.MEDIA_ID.replace(/^[a-zA-Z]+:[a-zA-Z]+:/, "");
                findAppName(id).then(function (name) {
                  data.MEDIA_ID = name;
                });
              });
            }

            setupMediaId();

            // values of ignored contexts of adGroupId
            scope.ignoredContextsData = allocationTable.$ignored_contexts.map(function (allocation) {
              allocation.$allocation_id.WEIGHTED_CONVERSIONS = allocation.$weighted_conversions;
              allocation.$allocation_id.RATIO_TO_SPEND = allocation.$ratio_to_spend;
              return allocation.$allocation_id;
            });

            // list of display networks of the allocation table
            var uniqueDisplayNetworksIds = _.union(_.uniq(scope.allocationsData.map(function (display) {
                return display.DISPLAY_NETWORK_ID;
              })),
              _.uniq(scope.ignoredContextsData.map(function (context) {
                return context.DISPLAY_NETWORK_ID;
              })));

            $q.all(uniqueDisplayNetworksIds.map(function (displayId) {
              return Restangular.one("display_networks", displayId).get({"organisation_id": scope.organisationId})
                .then(function (d) {
                    return d;
                  },
                  function (e) {
                    return {id: displayId, name: "Undefined display network " + displayId};
                  }
                );
            })).then(function (res) {

              //used only to filter display networks by name
              scope.uniqueDisplayNetworksIdsFilter = res.map(function (val) {
                return {id: val.name, title: val.name};
              });

              //to access display network name by id
              scope.uniqueDisplayNetworksObj = {};
              res.map(function (val) {
                scope.uniqueDisplayNetworksObj[val.id] = val.name;
              });

              // adding display network name in allocations and ignored contexts
              scope.allocationsData = scope.allocationsData.map(function (allocation) {
                allocation.DISPLAY_NETWORK_NAME = scope.uniqueDisplayNetworksObj[allocation.DISPLAY_NETWORK_ID];
                return allocation;
              });
              scope.ignoredContextsData = scope.ignoredContextsData.map(function (context) {
                context.DISPLAY_NETWORK_NAME = scope.uniqueDisplayNetworksObj[context.DISPLAY_NETWORK_ID];
                return context;
              });

              //enable selecting all display networks
              scope.uniqueDisplayNetworksIdsFilter.unshift({
                id: "",
                title: "All"
              });

              scope.cols = [{
                field: "DISPLAY_NETWORK_NAME",
                title: "Display Network",
                filter: {
                  DISPLAY_NETWORK_NAME: "select"
                },
                filterData: scope.uniqueDisplayNetworksIdsFilter,
                show: true,
                sortable: "'DISPLAY_NETWORK_NAME'",
                getValue: interpolatedValue
              }, {
                field: "MEDIA_ID",
                title: "Media",
                filter: {
                  MEDIA_ID: "text"
                },
                show: true,
                sortable: "'MEDIA_ID'",
                getValue: formatMedia
              }, {
                field: "WEIGHTED_CONVERSIONS",
                title: "Weighted Conversions",
                show: true,
                sortable: "'WEIGHTED_CONVERSIONS'",
                getValue: interpolatedValue
              }, {
                field: "RATIO_TO_SPEND",
                title: "Percent Of Daily Budget",
                show: true,
                sortable: "'RATIO_TO_SPEND'",
                getValue: allocationRatioToPercent
              }];

              scope.allocationsTable = new NgTableParams({
                count: 10
              }, {
                data: scope.allocationsData
              });

              scope.ignoredContexts = new NgTableParams({
                count: 10
              }, {
                data: scope.ignoredContextsData
              });

              scope.allocationsTable.settings.counts = [];
              scope.ignoredContexts.settings.counts = [];

              scope.tableReady = true;

            });
          };

          var setAdGroupGoal = function (goalId, adGroupId) {
            Restangular.one("goals", goalId).get({"organisation_id": scope.organisationId}).then(function (goal) {
              _.find(scope.allocationTablesEnvironment, function (environment) {
                return environment.adGroup.id === adGroupId;
              }).goal = goal;
            });
          };

          scope.reloadAllocations = function () {

            var selectedEnvironment = _.find(scope.allocationTablesEnvironment, function (environment) {
              return environment.adGroup.id === scope.selectedAdGroup.id;
            });
            changeAllocation(selectedEnvironment);
          };

          scope.refreshAdGroups = function () {
            //to select only ad groups for the selected campaign
            scope.adGroupsForCampaign = _.filter(scope.allocationTablesEnvironment, function (o) {
              return o.campaign.id === scope.selectedCampaign.id;
            }).map(function (environment) {
              return environment.adGroup;
            });
          };

          scope.$watch('report', function (newVal) {
            if (newVal) {

              scope.report = newVal;

              //selecting from the report the adGroupId,campaignId and goalId for each allocation table
              var adGroupsIds = scope.report.$allocation_tables.map(function (all_table, i) {
                return {
                  adGroupId: all_table.$ad_group_id,
                  campaignId: all_table.$campaign_id,
                  goalId: all_table.$goal_id
                };
              });

              $q.all(adGroupsIds.map(function (adg) {
                return Restangular.one("display_campaigns", adg.campaignId).one("ad_groups", adg.adGroupId).get();
              })).then(function (adGroupsResult) {

                //global container,will be used to contains adgroups+campaigns+goals
                //each cell contains information about ad group, campaign and the optimized goal
                scope.allocationTablesEnvironment = adGroupsResult.map(function (adGroup) {
                  return {"adGroup": adGroup};
                });

                $q.all(adGroupsIds.map(function (adg) {
                  return Restangular.one("display_campaigns", adg.campaignId).get();
                })).then(function (campaignsResult) {

                  //for selecting a campaign on the front
                  scope.campaigns = campaignsResult;

                  //adding to each ad group its campaign
                  campaignsResult.map(function (campaignResult) {

                    //find the id of ad group for
                    var filteredAdGroupsId = _.filter(adGroupsIds, function (adg) {
                      return adg.campaignId === campaignResult.id;
                    }).map(function (filteredAdGroup) {
                      return filteredAdGroup.adGroupId;
                    });

                    _.filter(scope.allocationTablesEnvironment, function (environment) {
                      return filteredAdGroupsId.indexOf(environment.adGroup.id) !== -1;
                    }).map(function (environment) {
                      environment.campaign = campaignResult;
                    });

                  });

                  //fetch the goal for each ad group
                  adGroupsIds.map(function (adg) {
                    if (adg.goalId !== null) {
                      setAdGroupGoal(adg.goalId, adg.adGroupId);
                    }
                  });

                  // the fist time, show the first allocation table
                  scope.selectedEnvironment = scope.allocationTablesEnvironment[0];
                  scope.selectedAdGroup = scope.selectedEnvironment.adGroup;
                  scope.selectedCampaign = scope.selectedEnvironment.campaign;

                  scope.refreshAdGroups();
                  changeAllocation(scope.selectedEnvironment);
                });

              });

            }
          }, true);

        },

        templateUrl: 'src/core/bidOptimizer/reports/view.report.dynamic-allocation.html'
      };

    }
  ]);

});