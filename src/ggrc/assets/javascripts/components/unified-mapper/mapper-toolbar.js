/*!
 Copyright (C) 2017 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */
(function (can, GGRC, CMS) {
  'use strict';

  can.Component.extend('mapperToolbar', {
    tag: 'mapper-toolbar',
    template: can.view(
      GGRC.mustache_path +
      '/components/unified-mapper/mapper-toolbar.mustache'
    ),
    viewModel: {
      filter: '',
      statusFilter: null,
      statuses: [],
      mapper: {},
      isLoading: false,
      showStatusFilter: false,
      displayPrefs: null,
      init: function () {
        var self = this;
        CMS.Models.DisplayPrefs.getSingleton().then(function (displayPrefs) {
          self.attr('displayPrefs', displayPrefs);
          self.setStatusFilter();
        });
      },
      onSubmit: function () {
        this.dispatch('submit');
        if (this.attr('showStatusFilter')) {
          this.saveStatusFilter();
        }
      },
      onReset: function () {
        this.attr('filter', '');
        this.attr('statuses', []);
        this.dispatch('submit');
      },
      getModelName: function () {
        var Model = CMS.Models[this.attr('mapper.type')];
        return Model.model_singular;
      },
      setStatusFilter: function () {
        var modelName = this.getModelName();
        var showStatusFilter = GGRC.Utils.State.hasState(modelName);
        var statuses;
        this.attr('showStatusFilter', showStatusFilter);
        if (showStatusFilter) {
          statuses =
            this.attr('displayPrefs').getTreeViewStates(modelName);
          this.attr('statuses', statuses);
        } else {
          this.attr('statuses', []);
          this.attr('statusFilter', '');
        }
      },
      saveStatusFilter: function () {
        var modelName = this.getModelName();
        this.displayPrefs.setTreeViewStates(
          modelName,
          can.makeArray(this.attr('statuses'))
        );
      }
    },
    events: {
      '{viewModel.mapper} type': function () {
        this.viewModel.setStatusFilter();
      }
    }
  });
})(window.can, window.GGRC, window.CMS);
