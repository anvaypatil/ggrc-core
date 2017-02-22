/*!
    Copyright (C) 2017 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

(function (can, $) {
  var selectors = ['unified-mapper', 'unified-search']
    .map(function (val) {
      return '[data-toggle="' + val + '"]';
    });
  var DATA_CORRUPTION_MESSAGE = 'Some Data is corrupted! ' +
              'Missing Scope Object';
  var OBJECT_REQUIRED_MESSAGE = 'Required Data for In Scope Object is missing' +
    ' - Original Object is mandatory';

  can.Control.extend('GGRC.Controllers.MapperModal', {
    defaults: {
      component: GGRC.mustache_path + '/modals/mapper/component.mustache'
    },
    launch: function ($trigger, options) {
      var href = $trigger.attr('data-href') ||
        $trigger.attr('href');
      var modalId = 'ajax-modal-' + (href || '')
          .replace(/[\/\?=\&#%]/g, '-')
          .replace(/^-/, '');
      var $target =
        $('<div id="' + modalId + '" class="modal modal-selector hide"></div>');

      $target.modal_form({}, $trigger);
      this.newInstance($target[0], can.extend({
        $trigger: $trigger
      }, options));

      $target.on('hidden.bs.modal', function () {
        $(this).remove();
      });

      return $target;
    }
  }, {
    init: function () {
      this.element.html(can.view(this.options.component, this.options));
    }
  });

  $('body').on('click', selectors.join(', '), function (ev, disableMapper) {
    var btn = $(ev.currentTarget);
    var data = {};
    var isSearch;

    can.each(btn.data(), function (val, key) {
      data[can.camelCaseToUnderscore(key)] = val;
    });

    if (data.tooltip) {
      data.tooltip.hide();
    }
    if (!data.clickable) {
      ev.preventDefault();
    }

    isSearch = /unified-search/ig.test(data.toggle);

    if (disableMapper) {
      return;
    }

    if (!data.join_object_type) {
      throw new Error(OBJECT_REQUIRED_MESSAGE);
    }

    if (GGRC.Utils.Snapshots
        .isInScopeModel(data.join_object_type) && !isSearch) {
      openForSnapshots(btn, data);
    } else {
      openForCommonObjects(btn, data, isSearch);
    }

    function openForSnapshots(btn, data) {
      var config;
      var inScopeObject;

      if (data.is_new) {
        config = {
          object: data.join_object_type,
          type: data.join_option_type,
          relevantTo: [{
            eadOnly: true,
            type: data.snapshot_scope_type,
            id: data.snapshot_scope_id
          }]
        };
        GGRC.Controllers.MapperModal.launch(btn, can.extend(config, data));
        return;
      }

      if (!data.join_object_id) {
        throw new Error(OBJECT_REQUIRED_MESSAGE);
      }

      inScopeObject =
        CMS.Models[data.join_object_type].store[data.join_object_id];

      inScopeObject.updateScopeObject().then(function () {
        var scopeObject = inScopeObject.attr('scopeObject');

        if (!scopeObject.id) {
          GGRC.Errors.notifier('error', DATA_CORRUPTION_MESSAGE);
          setTimeout(function () {
            window.location.assign(location.origin + '/dashboard');
          }, 3000);
          return;
        }

        config = {
          object: data.join_object_type,
          'join-object-id': data.join_object_id,
          type: data.join_option_type,
          relevantTo: [{
            readOnly: true,
            type: scopeObject.type,
            id: scopeObject.id
          }]
        };

        GGRC.Controllers.MapperModal.launch(btn, can.extend(config, data));
      });
    }

    function openForCommonObjects(btn, data, isSearch) {
      var config = {
        object: data.join_object_type,
        type: data.join_option_type,
        'join-object-id': data.join_object_id,
        'search-only': isSearch,
        template: {
          title: isSearch ?
            '/static/mustache/base_objects/modal/search_title.mustache' : ''
        }
      };
      GGRC.Controllers.MapperModal.launch(btn, can.extend(config, data));
    }
  });
})(window.can, window.can.$);
