/*!
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */
(function (can, GGRC) {
  'use strict';

  GGRC.Components('mapperStatusFilter', {
    tag: 'mapper-status-filter',
    template: can.view(
      GGRC.mustache_path +
      '/components/unified-mapper/mapper-status-filter.mustache'
    ),
    viewModel: {
      statusesMap: new can.Map({}),
      statuses: [],
      statusFilter: '',
      _updateStatusesTimeout: null,
      init: function () {
        this.updateStatusesMapDebounced();
      },
      setStatusFilter: function () {
        var statusesMap = this.attr('statusesMap');
        var statuses = [];
        can.each(statusesMap, function (v, status) {
          if (v) {
            statuses.push(status);
          }
        });
        this.attr('statusFilter',
          GGRC.Utils.State.statusFilter(statuses, ''));
        this.updateStatuses(statuses);
      },
      updateStatuses: function (statuses) {
        if (_.isEqual(can.makeArray(this.attr('statuses')), statuses)) {
          return;
        }
        this.attr('statuses', statuses);
      },
      updateStatusesMap: function () {
        var statuses = this.attr('statuses');
        var statusesMap = new can.Map({});
        can.each(statuses, function (status) {
          statusesMap.attr(status, true);
        });
        statusesMap.bind('change', this.setStatusFilter.bind(this));
        this.attr('statusesMap', statusesMap);
        this.setStatusFilter();
      },
      updateStatusesMapDebounced: function () {
        clearTimeout(this.attr('_updateStatusesTimeout'));
        this.attr('_updateStatusesTimeout',
          setTimeout(this.updateStatusesMap.bind(this)));
      }
    },
    events: {
      '{viewModel} statuses': function () {
        this.viewModel.updateStatusesMapDebounced();
      }
    }
  });
})(window.can, window.GGRC);
