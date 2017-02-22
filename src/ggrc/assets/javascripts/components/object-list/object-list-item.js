/*!
 Copyright (C) 2017 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

(function (can) {
  'use strict';

  var tag = 'object-list-item';
  /**
   * Object List Item component
   */
  can.Component.extend({
    tag: tag,
    viewModel: {
      define: {
        selectionEl: {
          type: String,
          value: ''
        }
      },
      instance: {},
      isSelected: false,
      checkSelection: function (el, ev) {
        var filter = this.attr('selectionEl');
        return filter.length ?
          can.$(ev.target).closest(filter, el).length :
          true;
      },
      onSelect: function (el, ev) {
        var isSelected = this.checkSelection(el, ev);
        var event = isSelected ? 'selectItem' : 'deselectItem';
        this.dispatch(event);
      }
    },
    events: {
      '{this.element} click': function (el, ev) {
        this.viewModel.onSelect(el, ev);
      }
    }
  });
})(window.can, window.GGRC);
