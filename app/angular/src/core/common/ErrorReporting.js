define(['./module'], function (module) {
  "use strict";

  /**
   * This is a really simple error reporting module, nothing fancy.
   * It will send js errors to our backend.
   * I know there are a lost of paying solutions to track these and
   * display nice reports, etc but for now I just want to know WHY
   * a user has an issue. The fancy reports can come latter.
   */
  module.factory('core/common/ErrorReporting', [
    "tracekit", "jquery", "core/common/auth/Session",
    function (TraceKit, $, Session) {
      return {
        /**
         * Setup the report module: configure stuff, add the reporter.
         */
        setup: function setup() {
          TraceKit.remoteFetching = false;
          TraceKit.report.subscribe(function(errorReport) {

            errorReport.current_page = location.toString();
            errorReport.user_agent = navigator.userAgent;
            if(Session.getCurrentWorkspace()) {
              errorReport.current_organisation_id = Session.getCurrentWorkspace().organisation_id;
            }
            if(Session.getUserProfile()) {
              errorReport.user_id = Session.getUserProfile().id;
            }
            errorReport.current_datamart_id = Session.getCurrentWorkspace().datamart_id;

            // console.error("TRACEKIT REPORT", JSON.stringify(errorReport));
            $.ajax("/log_errors.html", {data: errorReport});
          });
        },
        /**
         * Report a new error.
         * @param {Error} e the error to report.
         */
        report: function report(e) {
          TraceKit.report(e);
        }
      };
    }
  ]);

});
