define(['./module', 'angular', 'lodash'], function (module, angular, _) {
  'use strict';

  var updateChartsStatistics = function ($scope, campaignId, CampaignAnalyticsReportService, ChartsService, charts) {
    var leftMetric = charts[0];
    var rightMetric = charts[1];

    // Get statistics according to time filter
    if ($scope.timeFilter === $scope.timeFilters[1]) {
      return CampaignAnalyticsReportService.hourlyPerformance(campaignId, leftMetric, rightMetric)
        .then(function (data) {
          $scope.chartData = data;
        });
    } else {
      return CampaignAnalyticsReportService.dailyPerformance(campaignId, leftMetric, rightMetric)
        .then(function (data) {
          $scope.chartData = data;
        });
    }
  };

  var updateStatistics = function ($scope, campaignId, CampaignAnalyticsReportService, ChartsService, charts, $q, ErrorService) {

    var currentStatObj = $scope.statisticsQuery = {
      rand: Math.random().toString(36).substring(8),
      isRunning: true,
      error: null
    };

    var promises = [];

    CampaignAnalyticsReportService.setDateRange($scope.date.reportDateRange);
    if (CampaignAnalyticsReportService.dateRangeIsToday()) {
      $scope.timeFilter = $scope.timeFilters[1];
    }

    $scope.xaxisdomain = [CampaignAnalyticsReportService.getStartDate().toDate().getTime(),
      CampaignAnalyticsReportService.getEndDate().toDate().getTime()
    ];

    promises.push(updateChartsStatistics($scope, campaignId, CampaignAnalyticsReportService, ChartsService, charts));

    promises.push(CampaignAnalyticsReportService.adGroupPerformance(campaignId, $scope.hasCpa).then(function (data) {
      // an other refresh was triggered, don't do anything !
      if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
        return;
      }

      $scope.adGroupPerformance = data;
    }));

    promises.push(CampaignAnalyticsReportService.adPerformance(campaignId, $scope.hasCpa).then(function (data) {
      // an other refresh was triggered, don't do anything !
      if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
        return;
      }

      $scope.adPerformance = data;
    }));

    promises.push(CampaignAnalyticsReportService.targetedSegmentPerformance(campaignId, $scope.hasCpa).then(function (data) {
      // an other refresh was triggered, don't do anything !
      if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
        return;
      }

      $scope.targetedSegmentPerformance = data;
    }));

    promises.push(CampaignAnalyticsReportService.discoveredSegmentPerformance(campaignId, $scope.hasCpa).then(function (data) {
      // an other refresh was triggered, don't do anything !
      if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
        return;
      }

      $scope.discoveredSegmentPerformance = data;
    }));

    // For unspeakable reasons (and hopefully soon-to-be-fixed ones) this triggers a huuuuge boost.
    // I'll work on these, please continue my combat if I fall.
    setTimeout(function () {
      promises.push(CampaignAnalyticsReportService.mediaPerformance(campaignId, $scope.hasCpa, "-click_count", 30).then(function (data) {
        // an other refresh was triggered, don't do anything !
        if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
          return;
        }

        $scope.mediaPerformance = data;
      }));


      // we now have all promises
      $q.all(promises).then(function () {
        currentStatObj.isRunning = false;
      }).catch(function (e) {
        currentStatObj.isRunning = false;
        currentStatObj.error = e;
        ErrorService.showErrorModal(e);
      });
    }, 500);

    CampaignAnalyticsReportService.kpi(campaignId, $scope.hasCpa).then(function (data) {
      $scope.kpis = data;
    });
  };

  /**
   * Campaign list controller
   */
  module.controller('core/campaigns/report/CampaignReportController', [
    '$scope', '$http', '$location', '$uibModal', '$log', '$stateParams', 'Restangular', 'core/campaigns/report/ChartsService', 'core/campaigns/DisplayCampaignService',
    'CampaignAnalyticsReportService', 'core/campaigns/CampaignPluginService', 'core/common/auth/Session', 'core/common/files/ExportService',
    'core/campaigns/goals/GoalsService', 'd3', 'moment', '$interval', '$q', 'core/common/ErrorService', 'core/common/auth/AuthenticationService',
    function ($scope, $http, $location, $uibModal, $log, $stateParams, Restangular, ChartsService, DisplayCampaignService, CampaignAnalyticsReportService, CampaignPluginService,
              Session, ExportService, GoalsService, d3, moment, $interval, $q, ErrorService, AuthenticationService) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      // Chart
      $scope.date = {reportDateRange: CampaignAnalyticsReportService.getDateRange()};
      $scope.reportDefaultDateRanges = CampaignAnalyticsReportService.getDefaultDateRanges();
      $scope.timeFilters = ['Daily', 'Hourly']; // Time filters order is important
      $scope.timeFilter = $scope.timeFilters[0];
      $scope.chartArea = "chart-area";
      $scope.charts = ['clicks', 'impressions'];
      $scope.getChartName = ChartsService.getChartName;

      // Tabs Set
      var tableHeadersKeys = Object.keys(CampaignAnalyticsReportService.getTableHeaders());
      $scope.reverseSort = true;
      $scope.orderBy = "clicks";

      Restangular.one('campaigns/' + $stateParams.campaign_id + '/goal_selections').get().then(function (goals) {
        for (var i = 0; i < goals.length; ++i) {
          if (GoalsService.isConversionType(goals[i].goal_selection_type)) {
            $scope.hasCpa = true;
            return;
          }
        }
        $scope.hasCpa = false;
      });

      $scope.ads = [];
      $scope.adGroups = [];
      DisplayCampaignService.getDeepCampaignView($stateParams.campaign_id).then(function (campaign) {
        $scope.campaign = campaign;
        $scope.optionsBidPrice.chart.yDomain = [0, campaign.max_bid_price];

        // display the adgroups/ads a first time with the stats (they can take some times)
        $scope.adGroups = sort(campaign.ad_groups);
        var ads = _.flatten(
          campaign.ad_groups.map(function (adGroup) {
            return adGroup.ads;
          })
        );
        $scope.ads = sort(ads);
      });

      /**
       * Data Table Export
       */

      var metricsTypes = {
        overview: "Overview",
        ads: "Ads",
        adGroups: "Ad Groups",
        sites: "Sites"
      };

      // TODO Generate Headers Dynamically
      var buildMetricsExportHeaders = function (metricsType) {
        var headers = ["Status", "Name", "Format"];
        if (metricsType === metricsTypes.sites) {
          headers = ["Display Network","Name"];
        } else if (metricsType === metricsTypes.adGroups) {
          headers = ["Status", "Name"];
        }
        headers = headers.concat(["Imp.", "CPM", "Spent", "Clicks", "CTR", "CPC"]);
        if ($scope.hasCpa) {
          headers.push("CPA");
        }
        return headers;
      };

      var buildExportData = function (metrics, metricsType, header) {
        var data = [];
        for (var i = 0; i < metrics.length; ++i) {
          var row = [metrics[i].status, metrics[i].name, metrics[i].format];
          if (metricsType === metricsTypes.adGroups) {
            row = [metrics[i].status, metrics[i].name];
          } else if (metricsType === metricsTypes.sites) {
            row = [metrics[i].display_network_name, metrics[i].name];
          }
          for (var j = 0; j < metrics[i].info.length; ++j) {
            row.push(metrics[i].info[j].value || '');
          }
          data.push(row);
        }
        return header.concat(data);
      };

      var buildExportOverview = function (header) {
        var metrics = [$scope.kpis.cpc, $scope.kpis.ctr, $scope.kpis.cpm, $scope.kpis.impressions_cost];
        if ($scope.hasCpa) {
          metrics.unshift($scope.kpis.cpa);
        }
        return header.concat([metrics]);
      };

      var buildExportHeader = function (metricsType) {
        var metricsHeaders = [];
        if (metricsType === metricsTypes.overview) {
          metricsHeaders = $scope.hasCpa ? ["CPA", "CPC", "CTR", "CPM", "Spent"] : ["CPC", "CTR", "CPM", "Spent"];
        } else {
          metricsHeaders = buildMetricsExportHeaders(metricsType);
        }
        return [
          ["Organisation:", Session.getOrganisationName($scope.campaign.organisation_id)],
          ["Campaign: ", $scope.campaign.name],
          ["From " + $scope.date.reportDateRange.startDate.format("DD-MM-YYYY"), "To " + $scope.date.reportDateRange.endDate.format("DD-MM-YYYY")],
          [],
          [metricsType],
          metricsHeaders
        ];
      };

      var buildCampaignMetricsExportData = function (ads, adGroups, sites) {
        var overviewData = buildExportOverview(buildExportHeader(metricsTypes.overview));
        var adsData = buildExportData(ads, metricsTypes.ads, buildExportHeader(metricsTypes.ads));
        var adGroupsData = buildExportData(adGroups, metricsTypes.adGroups, buildExportHeader(metricsTypes.adGroups));
        var sitesData = buildExportData(sites, metricsTypes.sites, buildExportHeader(metricsTypes.sites));
        return [
          {name: "Overview", data: overviewData},
          {name: "Ads", data: adsData},
          {name: "Ad Groups", data: adGroupsData},
          {name: "Sites", data: sitesData}
        ];
      };

      $scope.export = function (extension) {
        var currentExportObj = $scope.exportQuery = {
          rand: Math.random().toString(36).substring(8),
          isRunning: true,
          error: null
        };

        // Get all the media data on export
        CampaignAnalyticsReportService.mediaPerformance($stateParams.campaign_id, $scope.hasCpa, "-click_count", null).then(buildSites).then(function (builtMediaPerformances) {

          currentExportObj.isRunning = false;

          var sites = sort(builtMediaPerformances);
          var dataExport = buildCampaignMetricsExportData($scope.ads, $scope.adGroups, sites);
          ExportService.exportData(dataExport, $scope.campaign.name + '-Metrics', extension);
        }).catch(function (e) {
          currentExportObj.isRunning = false;
          currentExportObj.error = e;
          ErrorService.showErrorModal(e);
        });
      };

      /**
       * Data Table
       */

      var sort = function (array) {

        var reverseFactor = 1;
        if ($scope.reverseSort) {
          reverseFactor = -1;
        }

        function stringCompare(a, b) {
          var aVal = (a || "").toString();
          var bVal = (b || "").toString();
          return rawCompare(aVal, bVal); // lexicographic order
        }

        function rawCompare(a, b) {
          if (a === b) {
            return 0;
          } else if (a < b) {
            return -1;
          } else {
            return 1;
          }
        }

        var getInfoValue = function (ad, orderBy) {
          if (!ad.info) {
            return undefined;
          }
          for (var i = 0; i < ad.info.length; ++i) {
            if (ad.info[i].key === orderBy) {
              return ad.info[i].value;
            }
          }
        };

        if (tableHeadersKeys.indexOf($scope.orderBy) !== -1) {
          return array.sort(function (a, b) {
            var aValue = getInfoValue(a, $scope.orderBy);
            var bValue = getInfoValue(b, $scope.orderBy);
            return rawCompare(aValue, bValue) * reverseFactor;
          });
        } else if ($scope.orderBy === "format") {
          return array.sort(function (a, b) {
            var aValue = _.sum((a.format || "0x0").split("x"));
            var bValue = _.sum((b.format || "0x0").split("x"));
            return (aValue - bValue) * reverseFactor;
          });
        } else {
          // let's try values on the object
          return array.sort(function (a, b) {
            var aValue = a[$scope.orderBy];
            var bValue = b[$scope.orderBy];
            return stringCompare(aValue, bValue) * reverseFactor;
          });
        }

      };

      $scope.findAdGroup = function (adId) {
        for (var i = 0; i < $scope.adGroups.length; ++i) {
          for (var j = 0; j < $scope.adGroups[i].ads.length; ++j) {
            if ($scope.adGroups[i].ads[j].id === adId) {
              return $scope.adGroups[i];
            }
          }
        }
      };

      $scope.sortAdsBy = function (key) {
        $scope.reverseSort = (key !== $scope.orderBy) ? false : !$scope.reverseSort;
        $scope.orderBy = key;
        $scope.ads = sort($scope.ads);
      };

      $scope.sortAdGroupsBy = function (key) {
        $scope.reverseSort = (key !== $scope.orderBy) ? false : !$scope.reverseSort;
        $scope.orderBy = key;
        $scope.adGroups = sort($scope.adGroups);
      };

      $scope.sortSitesBy = function (key) {
        CampaignAnalyticsReportService.mediaPerformance($stateParams.campaign_id, $scope.hasCpa, "-click_count", 30).then(function (mediaPerformance) {
          $scope.mediaPerformance = mediaPerformance;
          $scope.reverseSort = (key !== $scope.orderBy) ? false : !$scope.reverseSort;
          $scope.orderBy = key;
          buildSites(mediaPerformance).then(function (sites) {
            $scope.sites = sort(sites);
          });
        });
      };

      $scope.sortTargetedSegmentsBy = function (key) {
        CampaignAnalyticsReportService.targetedSegmentPerformance($stateParams.campaign_id, $scope.hasCpa, "-click_count", 30).then(function (segmentPerformance) {
          $scope.targetedSegmentPerformance = segmentPerformance;
          $scope.reverseSort = (key !== $scope.orderBy) ? false : !$scope.reverseSort;
          $scope.orderBy = key;
          $scope.targetedSegments = sort(buildAudienceSegments(segmentPerformance));
        });
      };

      $scope.sortDiscoveredSegmentsBy = function (key) {
        CampaignAnalyticsReportService.discoveredSegmentPerformance($stateParams.campaign_id, $scope.hasCpa, "-click_count", 30).then(function (segmentPerformance) {
          $scope.discoveredSegmentPerformance = segmentPerformance;
          $scope.reverseSort = (key !== $scope.orderBy) ? false : !$scope.reverseSort;
          $scope.orderBy = key;
          $scope.discoveredSegments = sort(buildAudienceSegments(segmentPerformance));
        });
      };

      var buildAudienceSegments = function (segmentPerformance) {
        // Since the segments data contains id + name, it isn't counted as a metric.
        var offset = 2;

        // Get media performance info indexes to identify the media information
        var clicksIdx = segmentPerformance.getHeaderIndex("clicks") - offset;
        var impIdx = segmentPerformance.getHeaderIndex("impressions") - offset;
        var ctrIdx = segmentPerformance.getHeaderIndex("ctr") - offset;

        var buildSegmentMetrics = function (metrics) {
          // Build ad info object using ad performance values. Ad info is used to display and sort the data values.
          var info = [];
          info[0] = {key: "impressions", type: metrics[impIdx].type, value: metrics[impIdx].value || 0};
          info[1] = {key: "clicks", type: metrics[clicksIdx].type, value: metrics[clicksIdx].value || 0};
          info[2] = {key: "ctr", type: metrics[ctrIdx].type, value: metrics[ctrIdx].value || 0};
          return info;
        };

        var segments = [];
        var segmentRows = segmentPerformance.getRows();
        for (var i = 0; i < segmentRows.length; ++i) {
          var metrics = segmentPerformance.decorate(segmentRows[i]);
          segments[i] = {id: segmentRows[i][0], name: segmentRows[i][1], metrics: buildSegmentMetrics(metrics)};
        }

        return segments;
      };

      $scope.$watch('targetedSegmentPerformance', function (targetedSegmentPerformance) {
        if (angular.isDefined(targetedSegmentPerformance)) {
          $scope.targetedSegments = sort(buildAudienceSegments(targetedSegmentPerformance));
        }
      });

      $scope.$watch('discoveredSegmentPerformance', function (discoveredSegmentPerformance) {
        if (angular.isDefined(discoveredSegmentPerformance)) {
          $scope.discoveredSegments = sort(buildAudienceSegments(discoveredSegmentPerformance));
        }
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

      var buildSites = function (mediaPerformance) {
        // Get media performance info indexes to identify the media information
        var siteClicksIdx = mediaPerformance.getHeaderIndex("clicks");
        var siteSpentIdx = mediaPerformance.getHeaderIndex("impressions_cost");
        var siteImpIdx = mediaPerformance.getHeaderIndex("impressions");
        var siteCpmIdx = mediaPerformance.getHeaderIndex("cpm");
        var siteCtrIdx = mediaPerformance.getHeaderIndex("ctr");
        var siteCpcIdx = mediaPerformance.getHeaderIndex("cpc");
        var siteCpaIdx = mediaPerformance.getHeaderIndex("cpa");

        var addSiteInfo = function (site, siteInfo) {
          // Build ad info object using ad performance values. Ad info is used to display and sort the data values.
          site.info = [];
          site.info[0] = {key: "impressions", type: siteInfo[siteImpIdx].type, value: siteInfo[siteImpIdx].value || 0};
          site.info[1] = {key: "cpm", type: siteInfo[siteCpmIdx].type, value: siteInfo[siteCpmIdx].value || 0};
          site.info[2] = {key: "impressions_cost", type: siteInfo[siteSpentIdx].type, value: siteInfo[siteSpentIdx].value || 0};
          site.info[3] = {key: "clicks", type: siteInfo[siteClicksIdx].type, value: siteInfo[siteClicksIdx].value || 0};
          site.info[4] = {key: "ctr", type: siteInfo[siteCtrIdx].type, value: siteInfo[siteCtrIdx].value || 0};
          site.info[5] = {key: "cpc", type: siteInfo[siteCpcIdx].type, value: siteInfo[siteCpcIdx].value || 0};
          if ($scope.hasCpa) {
            site.info[6] = {key: "cpa", type: siteInfo[siteCpaIdx].type, value: siteInfo[siteCpaIdx].value || 0};
          }
          return site;
        };

        var siteRows = mediaPerformance.getRows();

        var promises = siteRows.map(function (row) {
          var id = row[0].replace(/^[a-zA-Z]+:[a-zA-Z]+:/, "");
          if (row[0].startsWith("app:ios")) {
            return findAppName(id).then(function (name) {
              var site = {name: name, display_network_name:row[2]};
              var siteInfo = [row[0],row[1],row[2]].concat(mediaPerformance.decorate(row));
              return addSiteInfo(site, siteInfo);
            });
          } else {
            var site = {name: id, display_network_name:row[2]};
            var siteInfo = [row[0],row[1],row[2]].concat(mediaPerformance.decorate(row));
            return $q.resolve(addSiteInfo(site, siteInfo));
          }
        });

        return $q.all(promises);
      };

      $scope.$watch('mediaPerformance', function (mediaPerformance) {
        if (angular.isDefined(mediaPerformance)) {
          buildSites(mediaPerformance).then(function (sites) {
            $scope.sites = sort(sites);
          });
        }
      });

      $scope.$watchGroup(['campaign', 'adPerformance', 'adGroupPerformance'], function (values) {
        var campaign = values[0];
        var adPerformance = values[1];
        var adGroupPerformance = values[2];

        if (!campaign) {
          return;
        }

        if (angular.isDefined(adPerformance) && angular.isDefined(adGroupPerformance)) {

          // Get ad performance info indexes to identify the ad information
          var adClicksIdx = adPerformance.getHeaderIndex("clicks");
          var adSpentIdx = adPerformance.getHeaderIndex("impressions_cost");
          var adImpIdx = adPerformance.getHeaderIndex("impressions");
          var adCpmIdx = adPerformance.getHeaderIndex("cpm");
          var adCtrIdx = adPerformance.getHeaderIndex("ctr");
          var adCpcIdx = adPerformance.getHeaderIndex("cpc");
          var adCpaIdx = adPerformance.getHeaderIndex("cpa");

          // Get ad group performance info indexes to identify the ad group information
          var adGroupClicksIdx = adGroupPerformance.getHeaderIndex("clicks");
          var adGroupSpentIdx = adGroupPerformance.getHeaderIndex("impressions_cost");
          var adGroupImpIdx = adGroupPerformance.getHeaderIndex("impressions");
          var adGroupCpmIdx = adGroupPerformance.getHeaderIndex("cpm");
          var adGroupCtrIdx = adGroupPerformance.getHeaderIndex("ctr");
          var adGroupCpcIdx = adGroupPerformance.getHeaderIndex("cpc");
          var adGroupCpaIdx = adGroupPerformance.getHeaderIndex("cpa");

          var addAdInfo = function (ad, info) {
            // Build ad info object using ad performance values. Ad info is used to display and sort the data values.
            ad.info = [];
            ad.info[0] = {key: "impressions", type: info[adImpIdx].type, value: info[adImpIdx].value || 0};
            ad.info[1] = {key: "cpm", type: info[adCpmIdx].type, value: info[adCpmIdx].value || 0};
            ad.info[2] = {key: "impressions_cost", type: info[adSpentIdx].type, value: info[adSpentIdx].value || 0};
            ad.info[3] = {key: "clicks", type: info[adClicksIdx].type, value: info[adClicksIdx].value || 0};
            ad.info[4] = {key: "ctr", type: info[adCtrIdx].type, value: info[adCtrIdx].value || 0};
            ad.info[5] = {key: "cpc", type: info[adCpcIdx].type, value: info[adCpcIdx].value || 0};
            if ($scope.hasCpa) {
              ad.info[6] = {key: "cpa", type: info[adCpaIdx].type, value: info[adCpaIdx].value || 0};
            }
            return ad;
          };

          var addAdGroupInfo = function (adGroup, info) {
            // Build ad group info object using ad group performance values.
            adGroup.info = [];
            adGroup.info[0] = {key: "impressions", type: info[adGroupImpIdx].type, value: info[adGroupImpIdx].value || 0};
            adGroup.info[1] = {key: "cpm", type: info[adGroupCpmIdx].type, value: info[adGroupCpmIdx].value || 0};
            adGroup.info[2] = {key: "impressions_cost", type: info[adGroupSpentIdx].type, value: info[adGroupSpentIdx].value || 0};
            adGroup.info[3] = {key: "clicks", type: info[adGroupClicksIdx].type, value: info[adGroupClicksIdx].value || 0};
            adGroup.info[4] = {key: "ctr", type: info[adGroupCtrIdx].type, value: info[adGroupCtrIdx].value || 0};
            adGroup.info[5] = {key: "cpc", type: info[adGroupCpcIdx].type, value: info[adGroupCpcIdx].value || 0};
            if ($scope.hasCpa) {
              adGroup.info[6] = {key: "cpa", type: info[adGroupCpaIdx].type, value: info[adGroupCpaIdx].value || 0};
            }
            return adGroup;
          };

          $scope.adGroups = campaign.ad_groups.map(function (ad_group) {
            var adGroupInfo = [ad_group.id].concat(adGroupPerformance.getRow(ad_group.id));
            return addAdGroupInfo(ad_group, adGroupInfo);
          });

          var ads = _.flatten(
            campaign.ad_groups.map(function (adGroup) {
              return adGroup.ads;
            })
          );

          $scope.ads = ads.map(function (ad) {
            var adInfo = [ad.id].concat(adPerformance.getRow(ad.id));
            return addAdInfo(ad, adInfo);
          });

          $scope.ads = sort($scope.ads);
          $scope.adGroups = sort($scope.adGroups);
        }
      });

      /**
       * Stats
       */
      $scope.$watchGroup(['date.reportDateRange', 'hasCpa'], function (values) {
        if (angular.isDefined(values[0]) && angular.isDefined(values[1])) {
          $scope.timeFilter = $scope.timeFilters[0];
          updateStatistics($scope, $stateParams.campaign_id, CampaignAnalyticsReportService, ChartsService, $scope.charts, $q, ErrorService);
        }
      });

      $scope.refresh = function () {
        updateStatistics($scope, $stateParams.campaign_id, CampaignAnalyticsReportService, ChartsService, $scope.charts, $q, ErrorService);
      };

      /**
       * Chart Utils
       */

      $scope.isHourlyMode = function () {
        return $scope.timeFilter === $scope.timeFilters[1];
      };

      $scope.dateRangeIsToday = function () {
        return CampaignAnalyticsReportService.dateRangeIsToday();
      };


      $scope.chooseCharts = function () {
        var modalInstance = $uibModal.open({
          templateUrl: 'src/core/campaigns/report/ChooseCharts.html',
          scope: $scope,
          backdrop: 'static',
          controller: 'core/campaigns/report/ChooseChartsController',
          size: 'lg',
          resolve: {
            charts: function () {
              return $scope.charts;
            }
          }
        });

        modalInstance.result.then(function (charts) {
          $scope.charts = charts;
          updateChartsStatistics($scope, $stateParams.campaign_id, CampaignAnalyticsReportService, ChartsService, charts);
        });
      };

      //$scope.showDetails = function () {
      //  $scope.details = !$scope.details;
      //  if ($scope.chartArea === "chart-area")
      //    $scope.chartArea = "chart-area show-details";
      //  else
      //    $scope.chartArea = "chart-area";
      //  updateChartsStatistics($scope, $stateParams.campaign_id, CampaignAnalyticsReportService, ChartsService, $scope.charts);
      //};

      /**
       * Campaigns Management
       */

      $scope.$watch('campaign', function (campaign) {
        if (campaign !== undefined) {
          CampaignPluginService.getCampaignEditorFromVersionId($scope.campaign.editor_version_id).then(function (template) {
            $scope.template = template;
          });
        }
      });

      $scope.editCampaign = function (campaign) {
        if ($scope.template) {
          var location = $scope.template.editor.getEditPath(campaign);
          $location.path(location);
        }
      };

      $scope.deleteCampaign = function (campaign) {
        var newScope = $scope.$new(true);
        newScope.campaign = campaign;
        $uibModal.open({
          templateUrl: 'src/core/campaigns/delete.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/campaigns/DeleteController'
        });
      };

      /**
       * Utils
       */

      $scope.getCreativeUrl = function (ad) {
        var type = "display-ad";
        if (ad.creative_editor_group_id === "com.mediarithmics.creative.video") {
          type = "video-ad";
        }
        return Session.getWorkspacePrefixUrl() + "/creatives/" + type + "/" + ad.creative_editor_artifact_id + "/edit/" + ad.creative_id;
      };

      /*
       * Bid sent, bid win and bid price charts options
       */
      $scope.optionsBidCount = {
        chart: {
          type: 'lineChart',
          height: 250,
          margin: {
            top: 20,
            right: 30,
            bottom: 40,
            left: 55
          },
          forceY: [0, 5],
          x: function (d) {
            return d.x;
          },
          y: function (d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          duration: 0,
          xAxis: {
            tickFormat: function (d) {
              return d3.time.format('%X')(new Date(d));
            }
          },
          yAxis: {
            tickFormat: function (d) {
              return d3.format('.0f')(d);
            }
          },
          legendPosition: 'right'
        }
      };

      $scope.optionsWinRate = {
        chart: {
          type: 'lineChart',
          height: 250,
          margin: {
            top: 20,
            right: 30,
            bottom: 40,
            left: 55
          },
          yDomain: [0, 1],
          x: function (d) {
            return d.x;
          },
          y: function (d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          duration: 0,
          xAxis: {
            tickFormat: function (d) {
              return d3.time.format('%X')(new Date(d));
            }
          },
          yAxis: {
            tickFormat: function (d) {
              return d3.format('%')(d);
            }
          },
          legendPosition: 'right'
        }
      };

      $scope.optionsBidPrice = {
        chart: {
          type: 'lineChart',
          height: 250,
          margin: {
            top: 20,
            right: 30,
            bottom: 40,
            left: 55
          },
          x: function (d) {
            return d.x;
          },
          y: function (d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          duration: 0,
          xAxis: {
            tickFormat: function (d) {
              return d3.time.format('%X')(new Date(d));
            }
          },
          yAxis: {
            tickFormat: function (d) {
              return d3.format('.02f')(d) + ' ' + $scope.campaign.currency_code;
            }
          },
          legendPosition: 'right'
        }
      };

      /*
       data of charts
       */

      $scope.optionsCPM = {
        chart: {
          type: 'lineChart',
          height: 250,
          margin: {
            top: 20,
            right: 30,
            bottom: 40,
            left: 55
          },
          x: function (d) {
            return d.x;
          },
          y: function (d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          duration: 0,
          xAxis: {
            tickFormat: function (d) {
              return d3.time.format('%X')(new Date(d));
            }
          },
          yAxis: {
            tickFormat: function (d) {
              return d3.format('.02f')(d) + ' ' + $scope.campaign.currency_code;
            }
          },
          legendPosition: 'right'
        }
      };

      var bidCountData = {
        values: [],
        key: 'Bid Count/s',
        color: '#00AC67',
        area: true
      };

      var bidWinRateData = {
        values: [],
        key: 'Win Rate',
        color: '#00AC67'
      };

      var aveWinningPriceData = {
        values: [],
        key: 'Average Winning Price',
        color: '#00AC67'
      };

      var aveLosingPriceData = {
        values: [],
        key: 'Average Losing Price',
        color: '#FE5858'
      };

      var aveCpmData = {
        values: [],
        key: 'CPM',
        color: '#00AC67'
      };

      $scope.dataBidCount = [bidCountData];
      $scope.dataBidWinRate = [bidWinRateData];
      $scope.dataBidPrice = [aveWinningPriceData, aveLosingPriceData];
      $scope.dataAveCpmData = [aveCpmData];

      $scope.refreshGraph = {
        refreshInterval: 2,
        refreshDataTab: false,
        refreshIntervals: [2, 5, 10]
      };

      $scope.statsLoading = true;

      var statsAtT1 = null;
      var time1 = null;

      /*
       function to count delta metrics
       */
      var deltaStats = function (stats, unixTime) {

        var delta = {
          bidCount: 0,
          winRate: 0,
          aveWiningBidPriceCPM: 0,
          aveLosingBidPriceCPM: 0,
          cpm: 0
        };

        var winningBidCountIdx = stats.getHeaderIndex("impressions");
        var losingBidCountIdx = stats.getHeaderIndex("losing_bid_count");
        var winningBidPriceIdx = stats.getHeaderIndex("winning_bid_price");
        var losingBidPriceIdx = stats.getHeaderIndex("losing_bid_price");
        var impressionsCostIdx = stats.getHeaderIndex("impressions_cost");

        if (statsAtT1 === null) {
          statsAtT1 = stats;
          time1 = unixTime;

          return delta;
        } else {
          var rowAtT2 = stats.getRows()[0];
          var rowAtT1 = statsAtT1.getRows()[0];

          var deltaTSeconds = unixTime - time1;

          var deltaImpressions = (rowAtT2[winningBidCountIdx] - rowAtT1[winningBidCountIdx]) / deltaTSeconds;
          var deltaLosingBidCount = (rowAtT2[losingBidCountIdx] - rowAtT1[losingBidCountIdx]) / deltaTSeconds;
          var deltaImpressionsCost = (rowAtT2[impressionsCostIdx] - rowAtT1[impressionsCostIdx]) / deltaTSeconds;

          delta.cpm = (deltaImpressions > 0) ? (deltaImpressionsCost * 1000 / deltaImpressions ) : 0;
          delta.bidCount = deltaImpressions + deltaLosingBidCount;
          delta.winRate = (deltaImpressions + deltaLosingBidCount > 0) ? (deltaImpressions / (deltaImpressions + deltaLosingBidCount)) : 0;
          delta.aveWiningBidPriceCPM = (deltaImpressions > 0) ? ((rowAtT2[winningBidPriceIdx] - rowAtT1[winningBidPriceIdx]) * 1000 / (deltaImpressions * deltaTSeconds)) : 0;
          delta.aveLosingBidPriceCPM = (deltaLosingBidCount > 0) ? ((rowAtT2[losingBidPriceIdx] - rowAtT1[losingBidPriceIdx]) * 1000 / (deltaLosingBidCount * deltaTSeconds)) : 0;
          statsAtT1 = stats;
          time1 = unixTime;
          return delta;
        }

      };

      var refreshTimeoutId = null;

      $scope.$on("$destroy", function () {
        if (refreshTimeoutId) {
          clearTimeout(refreshTimeoutId);
        }
        $scope.refreshGraph.refreshDataTab = false;
      });

      var fetchAndUpdateLiveGraph = function () {

        var promise = $q.resolve();

        if ($scope.refreshGraph.refreshDataTab) {
          var x = moment();
          promise = CampaignAnalyticsReportService.livePerformance($stateParams.campaign_id, $scope.refreshGraph.refreshInterval).then(function (data) {
            $scope.livePerformance = data;
            var delta = deltaStats(data, x.unix());

            bidWinRateData.values.push({
              x: x.unix() * 1000,
              y: delta.winRate
            });

            aveWinningPriceData.values.push({
              x: x.unix() * 1000,
              y: delta.aveWiningBidPriceCPM
            });
            aveLosingPriceData.values.push({
              x: x.unix() * 1000,
              y: delta.aveLosingBidPriceCPM
            });

            bidCountData.values.push({
              x: x.unix() * 1000,
              y: Math.ceil(delta.bidCount)
            });

            aveCpmData.values.push({
              x: x.unix() * 1000,
              y: delta.cpm
            });

            $scope.dataBidCount = [bidCountData];
            $scope.dataBidWinRate = [bidWinRateData];
            $scope.dataBidPrice = [aveWinningPriceData, aveLosingPriceData];

            $scope.statsLoading = false;

            if ($scope.dataBidCount[0].values.length > 15) {

              $scope.dataBidCount[0].values.shift();
              $scope.dataBidWinRate[0].values.shift();
              $scope.dataBidPrice[0].values.shift();
              $scope.dataBidPrice[1].values.shift();
              $scope.dataAveCpmData[0].values.shift();
            }

          }).then(function () {
            $scope.$applyAsync(); // update both chart
          });
        }

        promise.then(function () {
          refreshTimeoutId = setTimeout(fetchAndUpdateLiveGraph, $scope.refreshGraph.refreshInterval * 1000);
        });

      };

      fetchAndUpdateLiveGraph();
    }
  ]);
});
