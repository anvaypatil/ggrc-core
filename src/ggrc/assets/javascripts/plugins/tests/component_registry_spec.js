/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

describe('GGRC component registry', function () {
  'use strict';

  var origStorage;  // the existing component private storage
  var Components;  // the component registry utility

  beforeAll(function () {
    Components = GGRC.Components;
  });

  beforeEach(function () {
    origStorage = Components._registry;
    Components._registry = {};
  });

  afterEach(function () {
    Components._registry = origStorage;
  });

  describe('using the Components registry as a function', function () {
    var componentConfig;
    var fakeComponent;

    beforeEach(function () {
      componentConfig = {
        tag: 'foo-bar',
        template: 'Hello World!'
      };
      fakeComponent = function FooBar() {};

      spyOn(can.Component, 'extend').and.returnValue(fakeComponent);
    });

    it('adds a new component to the registry', function () {
      delete Components._registry.foo;
      Components('foo', componentConfig);
      expect(Components._registry.foo).toBe(fakeComponent);
    });

    it('returns the newly created component', function () {
      var result;
      delete Components._registry.foo;
      result = Components('foo', componentConfig);
      expect(result).toBe(fakeComponent);
    });

    it('throws an error if a component is already registered', function () {
      var componentConfig = {};

      Components._registry.foo = function FooBar() {};

      expect(function () {
        Components('foo', componentConfig);
      })
      .toThrow(new Error('Component already exists: foo'));
    });

    it('throws an error if registering a component under a blank name',
      function () {
        var componentConfig = {};

        expect(function () {
          Components('', componentConfig);
        })
        .toThrow(new Error('Component name must be a nonempty string.'));
      }
    );

    it('throws an error if the given name is not a string', function () {
      var componentConfig = {};

      expect(function () {
        Components(123, componentConfig);
      })
      .toThrow(new Error('Component name must be a nonempty string.'));
    });
  });

  describe('unregister() method', function () {
    it('removes a component from the registry', function () {
      Components._registry.foo = function FooBar() {};
      Components.unregister('foo');
      expect(Components._registry.foo).toBeUndefined();
    });

    it('silently does nothing if a component does not exist', function () {
      delete Components._registry.foo;  // the "foo" component does not exist

      try {
        Components.unregister('foo');
      } catch (err) {
        fail('An error should not have be thrown.');
      }
    });
  });

  describe('isRegistered() method', function () {
    it('returns true if a component is registered', function () {
      Components._registry.foo = function FooBar() {};
      expect(Components.isRegistered('foo')).toBe(true);
    });

    it('returns false if a component is not registered', function () {
      delete Components._registry.foo;
      expect(Components.isRegistered('foo')).toBe(false);
    });
  });

  describe('get() method', function () {
    it('returns the component registered under the given name', function () {
      var componentFoo = function () {};
      Components._registry.foo = componentFoo;
      expect(Components.get('foo')).toBe(componentFoo);
    });

    it('raises an error if a component does not exist', function () {
      delete Components._registry.foo;

      expect(function () {
        Components.get('foo');
      })
      .toThrow(new Error('Component not found: foo'));
    });
  });

  describe('getViewModel() method', function () {
    it('gets the component\'s viewModel' +
      'by registered component\'s name' +
      ' and viewModel is defined as simple Object', function () {
      var componentFoo = function () {};
      var viewModel = {a: 1, b: 2};
      componentFoo.prototype.viewModel = viewModel;
      Components._registry.foo = componentFoo;
      expect(Components.getViewModel('foo').attr().a).toBe(viewModel.a);
      expect(Components.getViewModel('foo').attr().b).toBe(viewModel.b);
    });

    it('gets the component\'s viewModel' +
      'by registered component\'s name' +
      ' and viewModel is defined as Can Map Object', function () {
      var componentFoo = function () {};
      var viewModel = can.Map.extend({a: 1, b: 2});
      componentFoo.prototype.viewModel = viewModel;
      Components._registry.foo = componentFoo;
      // create new Instance
      viewModel = new viewModel();
      expect(Components.getViewModel('foo').attr().a).toBe(viewModel.attr('a'));
      expect(Components.getViewModel('foo').attr().b).toBe(viewModel.attr('b'));
    });

    it('raises an error if a component does not exist', function () {
      delete Components._registry.foo;

      expect(function () {
        Components.getViewModel('foo');
      })
      .toThrow(new Error('Component not found: foo'));
    });
  });

  describe('casting default values', function () {
    var componentConfig;
    var template;
    var frag;
    var control;

    beforeEach(function () {
      template = null;
      frag = null;
      control = null;
      componentConfig = {
        tag: 'foo-bar',
        template: 'Hello World!',
        scope: {
        }
      };
      Components.unregister('fakeComponent');
    });

    describe('for booleans', function () {
      it('should get value from scope', function () {
        componentConfig.scope.hasValue = false;
        Components('fakeComponent', componentConfig);

        template = can.view.mustache('<foo-bar has-value="hasValue" />');
        frag = template({
          hasValue: true
        });

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe(true);
      });
      it('should cast value from element', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'boolean',
            'default': false
          }
        };
        Components('fakeComponent', componentConfig);

        template = can.view.mustache('<foo-bar has-value="true" />');
        frag = template();

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe(true);
      });
      it('should have default value', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'boolean',
            'default': false
          }
        };
        Components('fakeComponent', componentConfig, true);

        template = can.view.mustache('<foo-bar />');
        frag = template();

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe(false);
      });
      it('shouldn\'t pickup default value if exists on scope', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'boolean',
            'default': false
          }
        };
        Components('fakeComponent', componentConfig, true);

        template = can.view.mustache('<foo-bar has-value="hasValue" />');
        frag = template({
          hasValue: true
        });

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe(true);
      });
    });

    describe('for numbers', function () {
      it('should get value from scope', function () {
        componentConfig.scope.hasValue = 1;
        Components('fakeComponent', componentConfig);

        template = can.view.mustache('<foo-bar has-value="hasValue" />');
        frag = template({
          hasValue: 42
        });

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe(42);
      });
      it('should cast value from element', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'number',
            'default': 42
          }
        };
        Components('fakeComponent', componentConfig, true);

        template = can.view.mustache('<foo-bar has-value="1" />');
        frag = template();

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe(1);
      });
      it('should have default value', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'number',
            'default': 42
          }
        };
        Components('fakeComponent', componentConfig, true);

        template = can.view.mustache('<foo-bar />');
        frag = template();

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe(42);
      });
      it('shouldn\'t pickup default value if exists on scope', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'number',
            'default': 42
          }
        };
        Components('fakeComponent', componentConfig, true);

        template = can.view.mustache('<foo-bar has-value="hasValue" />');
        frag = template({
          hasValue: 1
        });

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe(1);
      });
    });
    describe('for strings', function () {
      it('should get value from scope', function () {
        componentConfig.scope.hasValue = 'World';
        Components('fakeComponent', componentConfig);

        template = can.view.mustache('<foo-bar has-value="hasValue" />');
        frag = template({
          hasValue: 'Hello'
        });

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe('Hello');
      });
      it('should cast value from element', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'string',
            'default': 'Hello'
          }
        };
        Components('fakeComponent', componentConfig, true);

        template = can.view.mustache('<foo-bar has-value="World" />');
        frag = template();

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe('World');
      });
      it('should have default value', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'string',
            'default': 'Hello'
          }
        };
        Components('fakeComponent', componentConfig, true);

        template = can.view.mustache('<foo-bar />');
        frag = template();

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe('Hello');
      });
      it('shouldn\'t pickup default value if exists on scope', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'string',
            'default': 'Hello'
          }
        };
        Components('fakeComponent', componentConfig, true);

        template = can.view.mustache('<foo-bar has-value="hasValue" />');
        frag = template({
          hasValue: 'World'
        });

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')).toBe('World');
      });
    });
    describe('for functions', function () {
      it('should get function from parent scope', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'function'
          }
        };
        Components('fakeComponent', componentConfig, true);

        template = can.view.mustache('<foo-bar can-has-value="hasValue" />');
        frag = template({
          hasValue: function () {
            return 'Hi';
          }
        });

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')()).toBe('Hi');
      });
      it('should get function from scope default value', function () {
        componentConfig.scope.define = {
          hasValue: {
            type: 'function',
            'default': function () {
              return 'Hi';
            }
          }
        };
        Components('fakeComponent', componentConfig, true);

        template = can.view.mustache('<foo-bar />');
        frag = template();

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hasValue')()).toBe('Hi');
      });
    });
    describe('for @ variables', function () {
      it('should get value from element', function () {
        componentConfig.scope = {
          hello: '@'
        };
        Components('fakeComponent', componentConfig);

        template = can.view.mustache('<foo-bar hello="World" />');
        frag = template();

        frag = $(frag);
        control = frag.find('foo-bar').control();
        expect(control.scope.attr('hello')).toBe('World');
      });
    });
  });
});
