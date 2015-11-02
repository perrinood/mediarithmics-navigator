define(['./module'], function (module) {

    'use strict';

    module.directive('mcsTimeline',[
         'Restangular', 'core/datamart/common/Common', 'jquery', 'core/common/auth/Session',
        'lodash', 'moment',function(Restangular, Common, $, Session, lodash, moment){

        return {
                restrict: 'E',
                scope: {
                    timelines: '=',
                    loadMoreActions : '=',
                    showMore: '=',
                    organisationId: '='

        },
                link: function link(scope, element, attrs){

                    scope.INITIAL_ACTIONS_PER_ACTIVITY = 4;
                    scope.itemUrl = function (catalogId, itemId) {
                        return '#/' + scope.organisationId + '/datamart/items/' + catalogId + '/' + itemId;
                    };
                    scope.catalogUrl = function (catalogId) {
                        return "#/" + scope.organisationId + "/datamart/categories/" + catalogId;
                    };

                    // Transforms a duration to human a readable 'X days Y hours Z minutes' format
                    scope.toHumanReadableDuration = function(duration) {
                        return moment.duration(duration,'seconds').format("d [days] h [hours] m [minutes] s [seconds]");
                    };

                    // Determines if the entry corresponding to an agent in the filter box should be enabled or not
                    scope.isAgentEnabled = function(agent) {
                        // count visible agents
                        var visible = 0;
                        for (var i = 0; i < scope.agents.length; i++) {
                            visible += scope.agents[i].visible ? 1 : 0;
                        }
                        // disble checkbox for the last visible so that there is always at leas one visible
                        if (visible <= 1) {
                            return !agent.visible;
                        } else {
                            return true;
                        }
                    };

                    // Returns the start_date property of the activity for ordering
                    scope.orderByVisitStartDate = function(activity) {
                        return activity.visit.start_date;
                    };


                    // Determines the number of actions to display for a visit depending on it's expanded/collapsed state
                    scope.getLimit = function(activity) {
                        if (activity && activity.expanded) {
                            return activity.expanded ? activity.actions.length : scope.INITIAL_ACTIONS_PER_ACTIVITY;
                        } else {
                            return scope.INITIAL_ACTIONS_PER_ACTIVITY;
                        }
                    };


                    // Handles the loaded actions of a visit by storing it back to the corresponding activity object
                    scope.handleActions = function(actions) {
                        // find activity by id
                        var activity = Common.collections.findById(scope.activities, actions.parentResource.parentResource.id + '_' + actions.parentResource.id);


                    };


                    scope.getMapKeys = function(obj){
                        return Object.keys(obj);
                    };


                    // Handles the loaded timeline by constructing an activity for each visit, then loads all actions for each
                    scope.handleVisits = function(timeline) {
                        // if there are more visits avaialble, but a limit is set, show the 'load more' button

                        //$scope.showLoadMore = true;

                        // store visits in parent agent
                        // iterate visits
                        for (var j = 0; j < timeline.length; j++) {
                            // assemble an activity and a composite id for it
                            var event = timeline[j];
                            var agent = lodash.find(scope.agents,  {'user_agent_id':  event.agent_id});
                            var activity = { id: agent.id + '_' + event.id, agent: agent, visit: event };

                            activity.actions = [];
                            activity.expanded = false;
                            for (var k = 0; k < event.items.length; k++) {
                                var action = event.items[k];
                                // fetch action
                                if (action.$type === 'performed_action') {
                                    action.details = Restangular.one('datamarts', scope.datamartId).one('actions', action.action_id).get().$object;
                                }
                                // fetch item
                                if (action.$type === '$added_to_cart' || action.$type === '$viewed') {
                                    activity.with_purchase = true;
                                    //                        action.item = Restangular.one('datamarts', $scope.datamartId).one('items', action.datasheet_id).get().$object;
                                }
                                activity.actions.push(action);
                            }

                            scope.activities.push(activity);
                            // fetch actions of each visit
                            //          Restangular.one('datamarts', $scope.datamartId).one('agents', visits.parentResource.id).one('visits', visits[j].id).all('activity').getList().then($scope.handleActions);
                        }
                    };

                    //used to show the footer only when the timeline is ready
                    //otherwise we show the footer even when we do not have a timeline
                    scope.isTimeLineReady = function(){

                        return typeof scope.timelines !== "undefined";
                    };

                    // prevent dropdown from closing on checkbox interaction
                    element.find('.dropdown-menu').click(function(e){
                        e.stopPropagation();
                    });

                },
                templateUrl: 'src/core/datamart/timeline/timeline-content.html' };

        }]);


});


