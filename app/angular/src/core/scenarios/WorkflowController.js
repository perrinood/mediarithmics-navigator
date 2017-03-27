define(['./module'], function (module) {

    'use strict';


    module.controller('core/scenarios/WorkflowController', [
        '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', '$state','core/campaigns/CampaignPluginService',
        function ($scope, $log, Restangular, Session, _, $stateParams, $location, $state, CampaignPluginService) {

            $scope.zoomlevel = 100;
            $scope.pos_x = 0;
            $scope.pos_y = 0;
            $scope.targetEndpointStyle = {
                endpoint: "Dot",
                paintStyle: {strokeStyle: "#00AB67", fillStyle: "#00AB67", radius: 1, lineWidth: 3},
                hoverPaintStyle: {fillStyle: "#007848", strokeStyle: "#007848"},
                maxConnections: -1,
                dropOptions: {
                    hoverClass: "hover",
                    activeClass: "active"
                },
                isTarget: true
            };
            $scope.sourceEndpointStyle = {
                endpoint: "Dot",
                paintStyle: {strokeStyle: "#00AB67", fillStyle: "transparent", radius: 7, lineWidth: 3 },
                isSource: true,
                connectorStyle: {
                    lineWidth: 1,
                    strokeStyle: "#61B7CF",
                    joinstyle: "round",
                    outlineColor: "white",
                    outlineWidth: 0
                },
                hoverPaintStyle: { lineWidth: 1,  strokeStyle: "#216477",  outlineWidth: 0 },
                connectorHoverStyle: {
                    lineWidth: 1,
                    strokeStyle: "#007848"
                },
                dragOptions: {}
            };
            $scope.getTemplate = function (state) {
                //resolve a template to use
                if (typeof state.template === 'undefined') {
                    return "/angular/src/core/scenarios/partials/defaultState.html";
                }
                if (state.template === 'fancyObject') {
                    return "/angular/src/core/scenarios/partials/secondaryState.html";
                }
                return "/angular/src/core/scenarios/partials/defaultState.html";
            };

            $scope.$watch("$parent.nodes", function (nodes) {
                if (typeof nodes !== "undefined") {
                    $log.debug(nodes);
                    var workflow = $scope.$eval("$parent.workflow");
                    var previousNode = null;
                    var node = null;
                    for(var i = 0; i < nodes.length ; i++) {
                        node = nodes[i];
                        $scope.stateObjects.push({
                            "id": node.id,
                            "sources": [
                                {
                                    "uuid": "src-" + node.id
                                }
                            ],
                            "targets": [{
                                "uuid": "target-" + node.id
                            }
                            ],
                            "x": (i +1) *300,
                            "y": 0
                        });


                    }
                    for(var j = 0; j < nodes.length ; j++) {
                        node = nodes[j];
                        if(workflow.begin_node_id === node.id) {
                            $scope.stateConnections.push({sourceUUID:"start", targetUUID:"target-" + node.id});
                        } else if(previousNode !== null) {
//                            $scope.stateConnections.push({sourceUUID:"src-" + previousNode.id, targetUUID:"target-" + node.id})
                        }
                        previousNode = node;
                    }
                    $scope.stateConnections.push({sourceUUID:"src-" + previousNode.id, targetUUID:"end" });
                }
            });

            $scope.stateObjects = [
                {
                    "name": "Start",
                    "template": "fancyObject",
                    "sources": [
                        {
                            "uuid": "start"
                        }
                    ],
                    "targets": [],
                    "x": 0,
                    "y": 0
                },

                {
                    "name": "End",
                    "template": "fancyObject",
                    "targets": [
                        {
                            "uuid": "end"
                        }
                    ],
                    "sources": [],
                    "x": 600,
                    "y": 0
                }
            ];


            $scope.stateConnections = [
//        { targetUUID:8, sourceUUID:2 },
//        { targetUUID:7, sourceUUID:9 },
//        { targetUUID:4, sourceUUID:12 }
            ];

            $scope.removeConnection = function (index) {
                $scope.stateConnections.splice(index, 1);
            };
            $scope.setActiveConnection = function (index) {
                if (typeof $scope.activeConnection !== 'undefined' && $scope.activeConnection.index === index) {
                    $scope.activeConnection = undefined;
                    return;
                }
                $scope.activeConnection = {
                    index: index,
                    connection: $scope.stateConnections[index]
                };
            };



            $scope.showCampaign = function (campaign, $event) {
                if ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                }

                CampaignPluginService.getCampaignEditor(campaign.group_id, campaign.artifact_id).then(function (template) {
                    var location = template.editor.getEditPath(campaign);
                    $location.path(location);
                });
            };


            $scope.onConnection = function (instance, connection, targetUUID, sourceUUID) {
                // still need a scope $apply
                // console.log('onConnection in controller');
                $scope.stateConnections.push({
                    'targetUUID': targetUUID,
                    'sourceUUID': sourceUUID,
                    'conn': connection
                });
                if(sourceUUID === 'start') {
                    Restangular.one('scenarios', $stateParams.scenario_id).one("workflow")
                      .post("begin", {id: targetUUID.replace('target-', '')})
                      .then(function (r, error) {

                      $state.transitionTo($state.current, $stateParams, {
                        reload: true, inherit: true, notify: true
                      });
                    });
                }
                $scope.$apply();
            };
        }

    ]);
});

