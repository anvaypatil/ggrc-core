/*!
    Copyright (C) 2017 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

(function (can) {
  'use strict';

  GGRC.Components('addObjectButton', {
    tag: 'add-object-button',
    template: can.view(
      GGRC.mustache_path +
      '/components/add-object-button/add-object-button.mustache'
    ),
    viewModel: {
      instance: null,
      linkclass: '@',
      content: '@',
      text: '@',
      singular: '@',
      plural: '@',
      define: {
        noparams: {
          type: 'htmlbool',
          value: false
        }
      }
    }
  });
})(window.can);
