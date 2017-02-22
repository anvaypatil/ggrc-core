
/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

(function (GGRC, can, _) {
  'use strict';

  if (_.isFunction(GGRC.Components)) {
    return;  // no need to create the component registry again
  }

  // make the registry publicly available
  GGRC.Components = Components;

  /**
   * An object representing the CanJS component registry.
   *
   * If invoked directly as a function, it creates a new component by
   * delegating the work to can.Component.extend(), and registers the resulting
   * constructor function under the given name.
   *
   * The name must be a nonempty string, and an error is thrown if the name has
   * already been taken.
   *
   * @param {String} name - the name under which to register the component
   * @param {Object} config - the component configuration object as expected
   *   by the underlying can.Component.extend() method
   * @param {Boolean} isLegacy - indicated if custom define plugin should be used
   * @return {Function} - the created component constructor
   */
  function Components(name, config, isLegacy) {
    var constructor;
    var definitions;

    if (!name || !_.isString(name)) {
      throw new Error('Component name must be a nonempty string.');
    }

    if (Components._registry[name]) {
      throw new Error('Component already exists: ' + name);
    }

    if (isLegacy) {
      if (config.scope && _.isObject(config.scope.define)) {
        definitions = config.scope.define;
        delete config.scope.define;
      }

      if (definitions) {
        config.scope = Components._extendScope(config.scope, definitions);
      }
    }

    constructor = can.Component.extend(config);
    Components._registry[name] = constructor;

    return constructor;
  }

  /**
   * Wrap component scope function
   *
   * @param {Function} originalScope - Component original scope
   * @param {Object} definitions - Type definitions and their defaults
   *
   * @return {Function} - Scope wrapped init function
   */
  Components._extendScope = function (originalScope, definitions) {
    return function (scope, parentScope, element) {
      var val;
      scope = scope || {};
      parentScope = parentScope || {};
      element = element instanceof jQuery ? element : $(element);

      _.each(originalScope, function (obj, key) {
        if (originalScope[key] === '@') {
          scope[key] = element.attr(can.camelCaseToDashCase(key));
        }
      });
      _.each(definitions, function (obj, key) {
        var prefix = '';
        if (obj.type === 'function') {
          prefix = 'can-';
        }
        val = element.attr(prefix + can.camelCaseToDashCase(key));
        val = Components._castValue(val, obj.type, parentScope);
        if (_.isUndefined(val) && _.has(obj, 'default')) {
          val = obj.default;
        }
        scope[key] = val;
      });

      return _.extend({}, originalScope, scope);
    };
  };

  /**
   * Cast scope values for default types
   *
   * @param {String} val - Value we get from element attribute
   * @param {String} type - Type for the value we need to get
   * @param {object} parentScope - Parent scope
   *
   * @return {Any} - Returns casted types
   */
  Components._castValue = function (val, type, parentScope) {
    var types = {
      'boolean': function (bool) {
        if (_.isBoolean(bool)) {
          return bool;
        }
        return bool === 'true';
      },
      string: function (str) {
        if (_.isString(str)) {
          return str;
        }
        if (_.isEmpty(str)) {
          return;
        }
        return String(str);
      },
      number: function (num) {
        if (_.isNumber(num)) {
          return num;
        }
        num = parseInt(num, 10);
        if (_.isNaN(num)) {
          return;
        }
        return num;
      },
      'function': function (fn) {
        if (!fn || !parentScope.attr(fn)) {
          return;
        }
        return parentScope.attr(fn);
      }
    };
    if (!types[type]) {
      console.warn('Cast value for `' + type + '` is not defined');
      return undefined;
    }

    if (val &&
        type !== 'function' &&
        parentScope.attr(val)) {
      val = parentScope.attr(val);
    }
    return types[type](val);
  };

  // the internal storage of the registered components
  Components._registry = {};

  /**
   * Remove a registered component from the registry.
   *
   * If the component already does not exist, the function silently does
   * nothing.
   *
   * @param {String} name - the name of the component to deregister
   */
  Components.unregister = function (name) {
    delete Components._registry[name];
  };

  /**
   * Checks whether a component exists in the registry.
   *
   * @param {String} name - the name of the component
   * @return {Boolean} - true if the component exists, false false otherwise
   */
  Components.isRegistered = function (name) {
    return !_.isUndefined(Components._registry[name]);
  };

  /**
   * Retrieve a component from the registry.
   *
   * If the component is not found, an error is thrown.
   *
   * @param {String} name - the name of the component to retrieve
   * @return {Function} - the component's constructor function
   */
  Components.get = function (name) {
    var component = Components._registry[name];

    if (!component) {
      throw new Error('Component not found: ' + name);
    }

    return Components._registry[name];
  };

  /**
   * Retrieve a Component's ViewModel from the registry.
   * If no such Component is defined, an error is thrown.
   * @param {String} name - the name of component to retrieve
   * @return {can.Map|Error} - Component's View Model
   */
  Components.getViewModel = function (name) {
    var viewModelConfig = Components.get(name).prototype.viewModel;
    // if viewModelConfig is already a can.Map constructor no need to create a temporary class
    if (can.isFunction(viewModelConfig)) {
      return new viewModelConfig();
    }
    return new (can.Map.extend(viewModelConfig));
  };
})(window.GGRC = window.GGRC || {}, can, _);
