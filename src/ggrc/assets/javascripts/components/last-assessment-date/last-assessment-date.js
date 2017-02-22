/*!
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

(function (can, GGRC) {
  'use strict';

  var queryAPI = GGRC.Utils.QueryAPI;
  var REQUESTED_TYPE = 'Assessment';
  var FILTER_OPTIONS = Object.freeze({
    current: 1,
    pageSize: 1,
    sortBy: 'finished_date',
    sortDirection: 'desc'
  });
  var REQUIRED_FIELDS = Object.freeze(['finished_date']);
  var ALLOWED_TYPES = Object.freeze(['Control', 'Objective']);

  GGRC.Components('lastAssessmentDate', {
    tag: 'last-assessment-date',
    template: '{{localize_date lastAssessmentDate}}',
    viewModel: {
      instance: null,
      lastAssessmentDate: null
    },
    init: function () {
      var instance = this.viewModel.instance;
      var isSnapshot;
      var id;
      var type;

      if (!instance) {
        return;
      }

      isSnapshot = !!this.viewModel.instance.snapshot;
      if (isSnapshot) {
        id = instance.snapshot.child_id;
        type = instance.snapshot.child_type;
      } else {
        id = instance.id;
        type = instance.type;
      }
      if (id && type && ALLOWED_TYPES.indexOf(type) > -1) {
        this.loadLastAssessment(type, id);
      }
    },
    loadLastAssessment: function (type, id) {
      var viewModel = this.viewModel;
      var params = queryAPI.buildParam(REQUESTED_TYPE, FILTER_OPTIONS, {
        type: type,
        operation: 'relevant',
        id: id
      }, REQUIRED_FIELDS);

      queryAPI.makeRequest({data: [params]}).then(function (response) {
        var assessment = response[0][REQUESTED_TYPE].values[0];
        var finishedDate;
        if (assessment) {
          finishedDate = assessment.finished_date;
        }
        viewModel.attr('lastAssessmentDate', finishedDate);
      });
    }
  });
})(window.can, window.GGRC);
