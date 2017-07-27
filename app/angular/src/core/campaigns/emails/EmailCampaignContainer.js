define(['./module'], function (module) {
  'use strict';

  /**
   * Campaign Container
   */
  module.factory("core/campaigns/emails/EmailCampaignContainer", [
    "$q", "lodash", "Restangular", "async", "$log", 'core/common/promiseUtils','core/common/auth/Session',
    function ($q, _, Restangular, async, $log, promiseUtils, Session) {

      var EmailCampaignContainer = function EmailCampaignContainer(editorVersionId) {
        this.value = {type: "EMAIL", editor_version_id: editorVersionId};

        this.goalSelections = [];
        this.removedGoalSelections = [];

        this.emailRouters = [];
        this.removedEmailRouters = [];

        this.emailTemplates = [];
        this.removedEmailTemplates = [];
      };

      EmailCampaignContainer.prototype.load = function (campaignId) {
        var root = Restangular.one('email_campaigns', campaignId);
        var meta = Restangular.one('campaigns', campaignId);
        var campaignResourceP = root.get();
        var emailRoutersP = root.getList('email_routers');
        var emailTemplatesP = root.getList('email_templates');
        // var goalSelectionsP = meta.getList('goal_selections');
        var self = this;
        var defered = $q.defer();

        $q.all([campaignResourceP, emailRoutersP, emailTemplatesP/*, goalSelectionsP*/])
          .then(function (result) {
            self.value = result[0];
            self.id = self.value.id;

            self.emailRouters = result[1];
            self.emailTemplates = result[2];
            // self.goalSelections = result[4];

            defered.resolve(self);
          }, function (reason) {
            defered.reject(reason);
          });
        return defered.promise;
      };

      EmailCampaignContainer.prototype.removeEmailRouter = function removeEmailRouter(router) {
        for (var i = 0; i < this.emailRouters.length; i++) {
          if (this.emailRouters[i].email_router_id === router.email_router_id) {
            this.emailRouters.splice(i, 1);
            if (router.id) {
              this.removedEmailRouters.push(router);
            }
          }
        }
      };

      EmailCampaignContainer.prototype.addEmailRouter = function addEmailRouter(router) {
        var existingRouter = _.find(this.emailRouters, function(r){
          return r.email_router_id === router.email_router_id;
        });
        if (!existingRouter){
          this.emailRouters.push(router);
        }
      };

      function saveEmailRouterTask(router, campaignId) {
        return function (callback) {
          $log.debug("saving email router", router.id);
          var promise;
          if (router.id) {
            promise = router.put();
          } else {
            promise = Restangular.one('email_campaigns', campaignId)
              .post('email_routers', router);
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      function deleteEmailRouterTask(router) {
        return function (callback) {
          $log.info("deleting email router", router.id);
          var promise;
          if (router.id) {
            promise = router.remove();
          } else {
            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      EmailCampaignContainer.prototype.removeEmailTemplate = function removeEmailTemplate(template) {
        for (var i = 0; i < this.emailTemplates.length; i++) {
          if (this.emailTemplates[i].email_template_id === template.email_template_id) {
            this.emailTemplates.splice(i, 1);
            if (template.id) {
              this.removedEmailTemplates.push(template);
            }
          }
        }
      };

      EmailCampaignContainer.prototype.addEmailTemplate = function addEmailTemplate(template) {
        this.emailTemplates = [];
        this.emailTemplates.push(template);
      };

      function saveEmailTemplateTask(template, campaignId) {
        return function (callback) {
          $log.debug("saving email template", template.id);
          var promise;
          if (template.id) {
            promise = template.put();

          } else {
            promise = Restangular.one('email_campaigns', campaignId)
              .post('email_templates', template);
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      function deleteEmailTemplateTask(template) {
        return function (callback) {
          $log.info("deleting email router", template.id);
          var promise;
          if (template.id) {
            promise = template.remove();
          } else {
            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      EmailCampaignContainer.prototype.persistDependencies = function persistDependencies(campaignId) {
        var self = this;

        var deleteEmailRouterTasks = _.map(self.removedEmailRouters, function(router) {
          return deleteEmailRouterTask(router);
        });

        var deleteEmailTemplateTasks = _.map(self.removedEmailTemplates, function(template) {
          return deleteEmailTemplateTask(template);
        });

        var addedRouters = _.filter(self.emailRouters, function(router) {
          return !router.id;
        });

        var addedTemplates = _.filter(self.emailTemplates, function(template) {
          return !template.id;
        });

        var saveEmailRouterTasks = _.map(addedRouters, function(router) {
          return saveEmailRouterTask(router, campaignId);
        });

        var saveEmailTemplateTasks = _.map(addedTemplates, function(template) {
          return saveEmailTemplateTask(template, campaignId);
        });

        var pList = [];
        pList = pList.concat(deleteEmailRouterTasks);
        pList = pList.concat(deleteEmailTemplateTasks);
        pList = pList.concat(saveEmailRouterTasks);
        pList = pList.concat(saveEmailTemplateTasks);

        var deferred = $q.defer();
        async.series(pList, function (err, res) {
          if (err) {
            deferred.reject(err);
          } else {
            $log.info(res.length + " email campaign dependencies saved");
            deferred.resolve(self);
          }
        });

        return deferred.promise;

      };



      /**
       * Create a new email campaign.
       * @return {$q.promise} a promise of the save operation.
       */
      EmailCampaignContainer.prototype.persist = function persist() {
        var self = this;
        var deferred = $q.defer();
        Restangular.all('email_campaigns').post(self.value, {organisation_id: Session.getCurrentWorkspace().organisation_id})
          .then(function (result) {
            var campaign = result;
            self.persistDependencies(campaign.id).then(function(result){
              deferred.resolve(campaign);
            }, deferred.reject);
          }, function (reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      };

      /**
       * Save an existing email campaign.
       * @return {$q.promise} a promise of the save operation.
       */
      EmailCampaignContainer.prototype.update = function update() {
        var self = this;
        var deferred = $q.defer();
        self.value.put().then(function (result) {
          var campaign = result;
          self.persistDependencies(campaign.id).then(function(result){
            deferred.resolve(campaign);
          }, deferred.reject);
        }, function (reason) {
          deferred.reject(reason);
        });
        return deferred.promise;
      };

      return EmailCampaignContainer;
    }
  ]);
});
