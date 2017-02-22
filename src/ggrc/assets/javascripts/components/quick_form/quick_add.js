/*!
    Copyright (C) 2017 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

(function (can, $) {
  /*
    Below this line we're defining a few can.Components, which are in this file
    because they work similarly to the quick form controller (in fact, you should
    expect the quick form controller to be refactored into a component in the
    future) but they share no code with the quick form controller.

    the first component is quick add.  It is meant to have one or more form elements
    and a data-toggle="submit" link which will create a new join object between
    the parent instance and some selected option instance (likely picked through an
    autocomplete dropdown).

    Technically you can choose your instance however you want, as long as you find
    some way of getting its value into the component scope.  Extending this component
    with other methods to do that is fine.  You can also just pass it in when
    instantiating the component.
  */
  GGRC.Components('quickAdd', {
    tag: "ggrc-quick-add",
    // <content> in a component template will be replaced with whatever is contained
    //  within the component tag.  Since the views for the original uses of these components
    //  were already created with content, we just used <content> instead of making
    //  new view template files.
    template: "<content/>",
    scope: {
      parent_instance: null,
      source_mapping: null,
      join_model: "@",
      model: null,
      delay: "@",
      quick_create: "@",
      verify_event: "@",
      modal_description: "@",
      modal_title: "@",
      modal_button: "@",
      attributes: {},
      define: {
        deferred: {
          type: 'boolean',
          'default': false
        }
      },
      create_url: function () {
        var value = $.trim(this.element.find("input[type='text']").val());
        var dfd;

        // We are not validating the URL because application can locally we can
        // have URL's that are valid, but they wouldn't pass validation i.e.
        // - hi/there
        // - hi.something
        // - http://something.com etc
        // and thus we decided to validate just string existence
        if (!value || _.isEmpty(value)) {
          dfd = $.Deferred();
          dfd.reject({
            message: 'Please enter a URL'
          });
          return dfd.promise();
        }
        dfd = new CMS.Models.Document({
          link: value,
          title: value,
          context: this.scope.parent_instance.context || new CMS.Models.Context({
            id: null
          }),
          owners: [{type: "Person", id: GGRC.current_user.id}],
        });
        return dfd.save();
      }
    },
    events: {
      init: function () {
        this.scope.attr("controller", this);
      },
      // The inserted event fires when the component content is added to the DOM.
      //  At this time, live bound rendering should be resolved, which is not the
      //  case during init.
      inserted: function (el) {
        this.element.find("input:not([data-mapping], [data-lookup])").each(function(i, el) {
          this.scope.attributes.attr($(el).attr("name"), $(el).val());
        }.bind(this));
      },
      'a[data-toggle=submit]:not(.disabled):not([disabled]) click': function (el, ev) {
        var scope = this.scope;
        var join_model_class;
        var join_object;
        var quick_create;
        var created_dfd;
        var verify_dfd = $.Deferred();

        if (scope.attr("verify_event")) {
          GGRC.Controllers.Modals.confirm({
            modal_description: scope.attr("modal_description"),
            modal_confirm: scope.attr("modal_button"),
            modal_title: scope.attr("modal_title"),
            button_view: GGRC.mustache_path + "/quick_form/confirm_buttons.mustache"
          }, verify_dfd.resolve);
        } else {
          verify_dfd.resolve();
        }

        verify_dfd.done(function () {
          if (this.scope.quick_create && this.scope.quick_create !== "@") {
            quick_create = this.scope[this.scope.quick_create].bind(this);
            if (quick_create) {
              created_dfd = quick_create();
              if (!this.scope.deferred) {
                created_dfd
                  .fail(function (error) {
                    $(document.body).trigger('ajax:flash', {
                      error: error.message
                    });
                  })
                  .done(function (data) {
                    this.scope.attr('instance', data);
                  }.bind(this));
              }
            }
          }
          if (!created_dfd) {
            created_dfd = $.Deferred().resolve();
          }

          if (created_dfd.state() === 'rejected') {
            created_dfd.fail(function (error) {
              $(document.body).trigger('ajax:flash', {
                error: error.message
              });
            });
            return;
          }

          if (this.scope.deferred) {
            created_dfd.done(function (instance) {
              this.scope.parent_instance
                .mark_for_addition('related_objects_as_source', instance);
              el.trigger('modal:success', instance);
            }.bind(this));
            return;
          }

          created_dfd.then(function() {
            if (this.scope.join_model && this.scope.join_model !== "@") {
              join_model_class = CMS.Models[this.scope.join_model] || CMS.ModelHelpers[this.scope.join_model];
              join_object = {};
              if (this.scope.join_model === "Relationship") {
                join_object["source"] = this.scope.parent_instance;
                join_object["destination"] = this.scope.instance;
              } else {
                join_object[this.scope.instance.constructor.table_singular] = this.scope.instance;
              }
              join_object = new join_model_class($.extend(
                join_object,
                {
                  context: this.scope.parent_instance.context
                              || new CMS.Models.Context({id : null}),
                },
                this.scope.attributes.serialize()
              ));
            } else {
              join_object = GGRC.Mappings.make_join_object(
                this.scope.parent_instance,
                this.scope.instance || this.scope.attributes.instance,
                $.extend({
                  context : this.scope.parent_instance.context
                            || new CMS.Models.Context({id : null})
                          },
                          this.scope.attributes.serialize())
              );
            }
            this.bindXHRToButton(
              join_object.save().done(function() {
                el.trigger("modal:success", join_object);
              }),
              el
              );
          }.bind(this));
        }.bind(this));
      },
      // this works like autocomplete_select on all modal forms and
      //  descendant class objects.
      autocomplete_select: function(el, event, ui) {
        var that = this;
        setTimeout(function() {
          that.scope.attr(el.attr("name"), ui.item);
        });
      },
      "input[null-if-empty] change" : function(el) {
        if (!el.val()) {
          this.scope.attributes.attr(el.attr("name"), null);
        }
      },
      "input:not([data-mapping], [data-lookup]) change" : function(el) {
        this.scope.attributes.attr(el.attr("name"), el.val());
      },
      ".ui-autocomplete-input modal:success" : function(el, ev, data, options) {
        var that = this,
          multi_map = data.multi_map,
          join_model_class,
          join_object;

        if(multi_map){
          var length = data.arr.length,
              my_data;

          if (length == 1){
            my_data = data.arr[0];

            GGRC.Mappings.make_join_object(
              this.scope.parent_instance,
              my_data,
              $.extend({
                context : this.scope.parent_instance.context
                        || new CMS.Models.Context({id : null})
                        },
                        this.scope.attributes.serialize())
            ).save().done(function() {
              that.element.find("a[data-toggle=submit]").trigger("modal:success");
            });
          }

          else{
            for(var i = 0; i < length-1; i++){
              my_data = data.arr[i];

              GGRC.Mappings.make_join_object(
                this.scope.parent_instance,
                my_data,
                $.extend({
                  context : this.scope.parent_instance.context
                          || new CMS.Models.Context({id : null})
                          },
                          this.scope.attributes.serialize())
              ).save().done(function(){});
            }
            my_data = data.arr[length-1];
            GGRC.Mappings.make_join_object(
              this.scope.parent_instance,
              my_data,
              $.extend({
                context : this.scope.parent_instance.context
                        || new CMS.Models.Context({id : null})
                        },
                        this.scope.attributes.serialize())
            ).save().done(function() {
              that.element.find("a[data-toggle=submit]").trigger("modal:success");
            });
          }
          //end multi-map
        } else {

          if (this.scope.join_model && this.scope.join_model !== "@") {
            join_model_class = CMS.Models[this.scope.join_model] || CMS.ModelHelpers[this.scope.join_model];
            join_object = new join_model_class(this.scope.attributes.serialize());
          } else {
            join_object = GGRC.Mappings.make_join_object(
              this.scope.parent_instance,
              data,
              $.extend({
                context : this.scope.parent_instance.context
                          || new CMS.Models.Context({id : null})
                        },
                        this.scope.attributes.serialize())
            );
          }
          join_object.save().done(function() {
             that.element.find("a[data-toggle=submit]").trigger("modal:success");
          });
        }
      }
    },
    helpers: {
      // Mapping-based autocomplete selectors use this helper to
      //  attach the mapping autocomplete ui widget.  These elements should
      //  be decorated with data-mapping attributes.
      mapping_autocomplete : function(options) {
        return function(el) {
          var $el = $(el);
          $el.ggrc_mapping_autocomplete({
            controller : options.contexts.attr("controller"),
            model : $el.data("model"),
            mapping : false
          });
        };
      }
    }
  }, true);
})(window.can, window.can.$);
