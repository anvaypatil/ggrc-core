/*!
 Copyright (C) 2017 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

(function (can, GGRC) {
  'use strict';

  var tpl = can.view(GGRC.mustache_path +
    '/components/assessment/mapped-objects/mapped-controls-popover.mustache');
  var tag = 'assessment-mapped-controls-popover';
  /*
   Default Response Object
   */
  var defaultResponseArr = [{
    Snapshot: {
      values: []
    }
  }, {
    Snapshot: {
      values: []
    }
  }];
  /**
   * ViewModel for Assessment Mapped Controls Popover.
   * @type {can.Map}
   */
  var viewModel = can.Map.extend({
    define: {
      /**
       * Public Attribute defining ID of Control's Snapshot
       * @type {Number}
       * @public
       */
      instanceId: {
        type: 'number',
        value: 0
      },
      /**
       * Private Attribute defining array of requested Objects, Types and Fields of Objects
       * @type {Array}
       * @private
       */
      queries: {
        type: '*',
        value: [
          {type: 'objectives', objName: 'Objective', fields: ['revision']},
          {type: 'regulations', objName: 'Regulation', fields: ['revision']}
        ]
      },
      /**
       * Public Attribute defining necessity of data loading
       * Should start loading only in case false is passed
       * @type {Boolean}
       * @public
       */
      performLoading: {
        type: 'boolean',
        value: false,
        set: function (newValue) {
          if (newValue) {
            // Start loading only if newValue is true
            this.loadItems();
          }
          return newValue;
        }
      },
      /**
       * Private attribute to indicate loading state
       * @private
       */
      isLoading: {
        type: 'boolean',
        value: false
      },
      objectives: {
        value: []
      },
      regulations: {
        value: []
      }
    },
    /**
     * Generate params required for Query API
     * @param {Number} id - Id of Control's Snapshot
     * @return {Object} request query object
     */
    getParams: function (id) {
      var params = {};
      // Right now we load only Snapshots of related Objectives and Regulations
      var relevant = {
        type: 'Snapshot',
        id: id,
        operation: 'relevant'
      };
      params.data = this.attr('queries')
        .map(function (query) {
          var resultingQuery = GGRC.Utils.QueryAPI
            .buildParam(query.objName, {}, relevant, query.fields);
          return GGRC.Utils.Snapshots.transformQuery(resultingQuery);
        });
      return params;
    },
    /**
     * Parse raw response data from Query API and set appropriate properties
     * @param {Array} responseArr - Raw Array of Data requested from Query API
     */
    setItems: function (responseArr) {
      responseArr.forEach(function (item, i) {
        // Order of items in Queries Object is the same as order of Requested Queries
        var type = this.attr('queries')[i].type;
        this.attr(type).replace(item.Snapshot.values
          .map(function (item) {
            return item.revision.content;
          }));
      }.bind(this));
    },
    loadItems: function () {
      var id = this.attr('instanceId');
      var params;

      if (!id) {
        this.setItems(defaultResponseArr);
        return;
      }
      params = this.getParams(id);

      this.attr('isLoading', true);

      GGRC.Utils.QueryAPI
        .makeRequest(params)
        .done(this.setItems.bind(this))
        .fail(function () {
          console.warn('Errors are: ', arguments);
          this.setItems(defaultResponseArr);
        }.bind(this))
        .always(function () {
          this.attr('isLoading', false);
        }.bind(this));
    }
  });
  /**
   * Specific Wrapper Component to present Controls only inner popover data.
   * Should Load on expand Related Objectives and Regulations
   */
  GGRC.Components('assessmentMappedControlsPopover', {
    tag: tag,
    template: tpl,
    viewModel: viewModel
  });
})(window.can, window.GGRC);
