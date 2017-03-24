define(['./module'], function (module) {

  'use strict';

  module.factory('core/keywords/KeywordListContainer', [
    "Restangular", "lodash", "core/common/auth/Session", "$log", "$location", "$q", "async", 'core/common/promiseUtils',
    function (Restangular, _, Session, $log, $location, $q, async, promiseUtils) {

      /**
       * Create a task (to be used by async.series) to create a keyword expression and bind it to a keyword list.
       * @param {String} kwListId the id of the keyword list.
       * @param {Object} expr the keyword expression to save.
       * @return {Function} the task.
       */
      function createKeywordExpressionTask(kwListId, expr, toKeep) {
        return function (callback) {
          var promise = null;
          if (!toKeep && expr.id) {
            $log.info("delete keyword expression", expr);
            promise = expr.remove();
          } else if(toKeep && !expr.id) {
            $log.info("saving keyword expression", expr);
            promise = Restangular
            .one('keyword_lists', kwListId)
            .all('keyword_expressions')
            .post(expr);
          }
          if (promise) {
            promiseUtils.bindPromiseCallback(promise, callback);
          } else {
            callback(null, null);
          }
        };
      }


      /**
       * Create a KeywordListContainer. This will hold two things : the keyword list and the keyword expressions.
       * /!\ this is NOT a keyword list selection !
       * @param {String} id the id of the keyword list, if any.
       */
      function KeywordListContainer(id) {
        this.id = id;
        if(id) {
          this.load(id);
        } else {
          this.keywordList = {
            name : "",
            list_type : "UNION"
          };
          this.keywordExpressions = [];
        }

        this.removedExpressions = [];
      }

      KeywordListContainer.prototype = {

        /**
         * Load asynchronously the keyword list and the keyword expressions for the provided keyword list id.
         * @param {String} id the id to load.
         * @return {$q.promise} the promise of the load.
         */
        load: function (id) {
          var requests = [
            Restangular.one('keyword_lists', id).get(),
            Restangular.one('keyword_lists', id).all('keyword_expressions').getList()
          ];
          var self = this;
          return $q.all(requests).then(function(data) {
            self.keywordList = data[0];
            self.keywordExpressions = data[1];

            self.id = self.keywordList.id;
          });
        },

        /**
         * Save (create or update) the keyword list and the keyword expressions.
         * @return {$q.promise} the promise of the save.
         */
        save : function () {
          var deferred = $q.defer();

          var kwPromise = null;

          if(!this.id) {
            // create the keyword list
            kwPromise = Restangular.all('keyword_lists').post(this.keywordList, {
              organisation_id: Session.getCurrentWorkspace().organisation_id
            });
          } else {
            kwPromise = this.keywordList.put();
          }

          var self = this;
          kwPromise.then(function (kwList) {
            self.id = kwList.id;
            // create keyword expressions on the list
            var tasks = [], expr, i;
            for(i = 0; i < self.keywordExpressions.length; i++) {
              expr = self.keywordExpressions[i];
              tasks.push(createKeywordExpressionTask(kwList.id, expr, true));
            }
            for(i = 0; i < self.removedExpressions.length; i++) {
              expr = self.removedExpressions[i];
              tasks.push(createKeywordExpressionTask(kwList.id, expr, false));
            }

            async.series(tasks, function (err, res) {
              if(err) {
                deferred.reject(err);
              } else {
                deferred.resolve(kwList);
              }
            });
          }, deferred.reject);
          return deferred.promise;
        },

        /**
         * Add a keyword expression if possible (it won't add it if it's already present).
         * @param {String} expression the text to add.
         * @param {boolean} exclude the exclusion of the expression.
         * @return {boolean} true if the expression has been added, false otherwise.
         */
        addExpression : function (expression, exclude) {
          if (!expression) {
            return false;
          }

          var found = _.find(this.keywordExpressions, function (expr) {
            return expression === expr.expression;
          });

          if(!found) {
            this.keywordExpressions.push({
              exclude : exclude,
              expression : expression
            });
            return true;
          }
          return false;
        },

        /**
         * Remove an expression from the current list.
         * @param {String} expression the text to remove
         * @param {Boolean} exclude the type of the expression.
         */
        removeExpression : function (expression, exclude) {
          var obj = _.find(this.keywordExpressions, function (expr) {
            // check exclude and expression to dedup between objects from restangular and ours.
            return expr.exclude === exclude && expr.expression === expression;
          });
          if (obj) {
            var idx = this.keywordExpressions.indexOf(obj);
            this.keywordExpressions.splice(idx, 1);
            this.removedExpressions.push(obj);
          }
        },

        /**
         * Remove all the expressions of a certain type (include or exclude) from the keywords expressions.
         * @param {Boolean} exclude the type to remove.
         */
        removeAllExpressions : function (exclude) {
          var toKeep = _.filter(this.keywordExpressions, function (expr) {
            return expr.exclude !== exclude;
          });
          var toDelete = _.filter(this.keywordExpressions, function (expr) {
            return expr.exclude === exclude;
          });

          this.keywordExpressions = toKeep;

          this.removedExpressions = this.removedExpressions.concat(toDelete);
        }
      };

      return KeywordListContainer;
    }
  ]);
});




