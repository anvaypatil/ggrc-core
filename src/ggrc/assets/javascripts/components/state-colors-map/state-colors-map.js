/*!
    Copyright (C) 2017 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

(function (can, GGRC) {
  'use strict';
  /* Default Sate for Assessment should be 'Not Started' */
  var defaultState = 'Not Started';
  var tpl = '<span style="color: {{color}};">{{state}}</span>';
  /* Predefined Colors Mapping Object for Assessment */
  var defaultColorsMap = {
    'Not Started': '#bdbdbd',
    'In Progress': '#ffab40',
    'Ready for Review': '#1378bb',
    Verified: '#333',
    Completed: '#8bc34a'
  };
  /**
   * can.Map(ViewModel) presenting behavior of State Colors Map Component
   * @type {can.Map}
   */
  var viewModel = can.Map.extend({
    define: {
      state: {
        type: 'string',
        value: defaultState
      },
      color: {
        get: function () {
          var colorsMap = this.attr('colorsMap') || defaultColorsMap;
          var color = colorsMap[this.attr('state')];
          if (!color) {
            console.warn('State of the Instance is not defined in Colors Map: ',
              this.attr('state'));
          }
          /* Set default 'Not Started' State Color in case incorrect state is provided */
          return color || colorsMap[defaultState];
        }
      },
      colorsMap: {
        type: '*',
        value: function () {
          return defaultColorsMap;
        }
      }
    }
  });
  /**
   * Simple Component to add color indication for Assessment State Name
   */
  GGRC.Components('stateColorsMap', {
    tag: 'state-colors-map',
    template: tpl,
    viewModel: viewModel
  });
})(window.can, window.GGRC);
