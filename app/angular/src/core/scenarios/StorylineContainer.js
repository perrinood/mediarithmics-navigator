define(['./module', 'lodash'], function (module, _) {
  'use strict';
  module.service('core/scenarios/StorylineContainer', [
    '$log','Restangular',  'core/common/promiseUtils','$q',  'async', 'core/datamart/queries/QueryContainer', 'core/common/auth/Session',
    'core/campaigns/CampaignPluginService',
    function ($log,Restangular,  promiseUtils, $q, async,QueryContainer, Session, CampaignPluginService) {
      function StorylineContainer(scenario) {
        var self = this;
        if(scenario) {
            scenario.one("storyline").get().then(function (storyline) {
              self.storyline = storyline;
              storyline.all("nodes").getList().then(function (nodes) {
                _.forEach(nodes,function (node) {
                  self.nodes.push(new NodeContainer(self.scenario,node));
                });
                storyline.all("edges").getList().then(function (edges) {
                  self.addEdges(edges);
                });
              });
            });
        }
        this.storyline = null;
        this.nodes =  [];
        this.edges =  [];
        this.scenario = scenario;


        this.removedEdges = [];
        this.removedNodes = [];
        this.sequence = 0;

        function findById(id) {
          return function(e) {
            return e.id === id;
          };
        }

        this.addNode = function (node) {
          node.id = 'T'+this.sequence;
          var self = this;
          node.save = function() {
            return self.scenario.one("storyline").all('nodes').post(node).then(function (r) {
              node.id = r.id;
            });
          };
          this.sequence++;
          this.nodes.push(new NodeContainer(this.scenario, node));
        };

        this.deleteNode = function (node) {
          this.nodes = _.without(this.nodes, node);
          if(node.id.indexOf("T") === -1){
            this.removedNodes.push(node);
          }

        };

        this.getEdge = function (from, handler, to, options){
          var inRemoved = options.inRemoved === true;
          var edges = _(this.edges);
          if(inRemoved) {
            edges = _(this.removedEdges);
          }
          return edges.find(function (e) {
            return e.source.id === from.id && e.handler === handler && e.target.id === to.id;
          });
        };

        this.getNode = function (id) {
          return _(this.nodes).find(findById(id));
        };

        this.addEdges = function(edges) {
          _.forEach(edges,function (e) {
            var from = this.getNode(e.source_id);
            var to = this.getNode(e.target_id);
            var handler = e.handler;
            this.addEdge(from, handler, to, e);
          }, this);

        };
        this.addEdge = function (from, handler, to, value) {
          var maybeExistingNode = this.getEdge(from, handler, to, {inRemoved: true});
          if(maybeExistingNode) {
            this.edges.push(maybeExistingNode);
            this.removedEdges = _.without(this.removedEdges, maybeExistingNode);
          } else {
            this.edges.push(new EdgeContainer(this.scenario, from, handler, to, value));
          }
          this.edges = _.uniq(this.edges, function(e) {return e.source.id + "-" + e.target.id + "-"+e.handler; });
        };

        this.removeEdge = function (edge) {
          if(edge && edge.value) {
            this.removedEdges.push(edge);
          }
          this.edges = _.without(this.edges, edge);


        };
        this.saveNodeTask = function saveTask(action, e) {
          var a = action;
          return function (callback) {

            $log.info(a, " : ", e);
            var promise;
            var action;

            if (a === "save") {
              promise = e.save();
            } else if(e.remove){
              promise = e.remove();
              // reuse the name of the campaign for the ad group
            }
            promiseUtils.bindPromiseCallback(promise, callback);
          };
        };
        this.saveNodes = function (nodes, action) {
          var self = this;
          var deferred = $q.defer(), tasks = [], i;
          for (i = 0; i < nodes.length; i++) {
            tasks.push(this.saveNodeTask(action, nodes[i]));
          }
          async.series(tasks, function (err, res) {
            if (err) {
              deferred.reject(err);
            } else {
              $log.info(res.length + " nodes " + action + "d");
              // return the campaign container as the promise results
              deferred.resolve(self);
            }

          });
          return deferred.promise;
        };
        this.saveWithNewScenario = function (newScenario) {
          this.scenario = newScenario;
          var self = this;
          return newScenario.one("storyline").get().then(function (storyline) {
            self.storyline = storyline;
            _.forEach(self.nodes, function (node){ node.scenario = newScenario;});
            _.forEach(self.edges, function (edge){ edge.scenario = newScenario;});
            return self.save();
          });

        };

        this.save = function save() {
          var self = this;
  //        return self.saveNodes(self.nodes, "save").then(function () {
  //          return self.saveNodes(self.edges, "save").then(function() {
  //            return self.saveNodes(self.removedEdges, "delete").then(function() {
  //              return self.saveNodes(self.removedNodes, "delete").then(function() {
  //                return self;
  //              });
  //            } );
  //          });

  //        });

          return self.saveNodes(self.nodes, "save")
          .then(function () {
            return self.saveNodes(self.edges, "save");
          }).then(function () {
            return self.saveNodes(self.removedEdges, "delete");
          }).then(function () {
            return self.saveNodes(self.removedNodes, "delete");
          }).then(function () {
            return self;
          });

        };


      }

      function EdgeContainer(scenario, source,handler, target, value) {
        this.source = source;
        this.handler= handler;
        this.target = target;
        this.scenario = scenario;
        this.value = value;
        this.save = function () {
          if(this.value && this.value.save) {
            return value.save();
          } else {
            var self = this;
            return this.scenario.one("storyline").all('edges').post({source_id: this.source.id, handler: this.handler, target_id: this.target.id}).then(function (result) {self.value = result;});
          }
        };
        this.remove = function() {
          return value.remove();
        };
      }
      function NodeContainer(scenario,node){
        var self = this;
        this.value = node;
        this.scenario = scenario;
        this.id = node.id;
        this.type = node.type;
        if(node.query_id) {
          var queryContainer = new QueryContainer(scenario.datamart_id, node.query_id);
          queryContainer.load().then(function sucess(loadedQueryContainer){
            self.queryContainer = loadedQueryContainer;
          }, function error(reason){
            if (reason.data && reason.data.error_id){
              $log.error("An error occured while loading trigger , errorId: " + reason.data.error_id);
            } else {
              $log.error("An error occured while loading trigger");
            }
          });
        } else {
          if(node.type === "QUERY_INPUT") {
            this.queryContainer = new QueryContainer(Session.getCurrentDatamartId());
            if (!this.value.name){
              //defaut node name
              this.value.name = "Query";
            }
          }
        }
        if(node.type === "DISPLAY_CAMPAIGN") {
          Restangular.one("campaigns", self.value.campaign_id).get().then(function (campaign) {
            self.campaign = campaign;
            Restangular.one("display_campaigns", campaign.id).one('ad_groups', self.value.ad_group_id).get().then(function (adGroup) {
              self.adGroup = adGroup;
            });
            CampaignPluginService.getCampaignEditorFromVersionId(campaign.editor_version_id).then(function (template) {
              self.campaign_editor_url = '#'+template.editor.getEditPath(campaign);
            });
          });
        }
	      if(node.type === "EMAIL_CAMPAIGN") {
          Restangular.one("campaigns", self.value.campaign_id).get().then(function (campaign) {
            self.campaign = campaign;
            CampaignPluginService.getCampaignEditorFromVersionId(campaign.editor_version_id).then(function (template) {
              self.campaign_editor_url = '#'+template.editor.getEditPath(campaign);
            });
          });
        }

        this.saveNode = function () {
           if(this.value.save) {
            return this.value.save();
          } else {
            var self = this;
            return this.scenario.one("storyline").all('nodes').post(self.value).then(function (result) {self.value = result;});
          }

        };

        this.updateQueryContainer = function(queryContainerUpdate) {
          $log.debug("update queryContainer with ", queryContainerUpdate);
          this.queryContainer = queryContainerUpdate;
        };

        this.save = function () {
          if(this.queryContainer) {
            var self = this;
            return this.queryContainer.saveOrUpdate().then(function sucess(updateQueryContainer){
              $log.log("finished saving ", updateQueryContainer, " update query id in node ", self);
              self.value.query_id = updateQueryContainer.id;
              return self.saveNode();
            });
          } else {
            return this.saveNode();
          }


        };


        this.remove = function() {
          return this.value.remove();
        };

      }

      return StorylineContainer;

    }]);
});
