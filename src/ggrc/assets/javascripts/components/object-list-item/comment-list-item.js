/*!
 Copyright (C) 2017 Google Inc., authors, and contributors
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

(function (can, GGRC) {
  'use strict';

  var tpl = can.view(GGRC.mustache_path +
    '/components/object-list-item/comment-list-item.mustache');
  var tag = 'comment-list-item';
  /**
   * Simple component to show Comment Objects
   */
  can.Component.extend({
    tag: tag,
    template: tpl,
    viewModel: {
      instance: {},
      define: {
        showIcon: {
          type: 'boolean',
          value: false
        },
        iconCls: {
          get: function () {
            return this.attr('showIcon') ?
            'fa-' + this.attr('itemData.title').toLowerCase() :
            '';
          }
        },
        itemData: {
          get: function () {
            return this.attr('instance');
          }
        },
        commentText: {
          get: function () {
            return this.attr('itemData.description');
          }
        },
        commentCreationDate: {
          get: function () {
            return this.attr('itemData.created_at');
          }
        },
        commentAuthor: {
          get: function () {
            return this.attr('itemData.modified_by') || false;
          }
        },
        commentAuthorType: {
          get: function () {
            return this.attr('itemData.assignee_type') || false;
          }
        },
        hasRevision: {
          get: function () {
            return this.attr('commentRevision') || false;
          }
        },
        commentRevision: {
          get: function () {
            return this.attr('itemData.custom_attribute_revision');
          }
        },
        customAttributeData: {
          get: function () {
            return this.attr('commentRevision.custom_attribute.title') +
           ':' + this.attr('commentRevision.custom_attribute_stored_value');
          }
        }
      }
    }
  });
})(window.can, window.GGRC);
