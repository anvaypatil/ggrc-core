/*!
 Copyright (C) 2017 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

(function (can, GGRC) {
  'use strict';

  var tag = 'collapsible-panel';
  var tpl = can.view(GGRC.mustache_path +
    '/components/collapsible-panel/collapsible-panel.mustache');
  var viewModel = can.Map.extend({
    titleText: '@',
    titleIcon: '@',
    extraCssClass: '@',
    define: {
      /**
       * Public attribute to indicate expanded/collapsed status of the component
       * @type {Boolean}
       * @public
       */
      expanded: {
        type: 'boolean',
        value: false
      }
    }
  });
  /**
   * Collapsible Panel component to add expand/collapse behavior
   */
  GGRC.Components('collapsiblePanel', {
    tag: tag,
    template: tpl,
    viewModel: viewModel
  });
})(window.can, window.GGRC);
