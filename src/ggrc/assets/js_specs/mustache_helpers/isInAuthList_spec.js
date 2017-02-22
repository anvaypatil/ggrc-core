/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

describe('can.mustache.helper.isInAuthList', function () {
  'use strict';

  var html;
  var render; // the rendering function returned by the template compilation
  var renderedText;
  var templateContext;

  /**
   * A factory for creating fake authorization object instances.
   *
   * @param {Object} personAttrs - attributes of the person object contained
   *   within the created authorization object
   *
   * @return {can.Map} - authorization object mock
   */
  function fakeAuthObj(personAttrs) {
    var result = new can.Map({
      instance: {
        person: personAttrs
      }
    });

    spyOn(result.instance.person, 'reify')
      .and.returnValue(result.instance.person);

    return result;
  }

  beforeAll(function () {
    var template = [
      '<div>',
      '  {{#isInAuthList person authorizations}}',
      '    yes',
      '  {{else}}',
      '    no',
      '  {{/isInAuthList}}',
      '</div>'
    ].join('');

    render = can.view.mustache(template);
  });

  it(
    'renders the falsy block if neither a person nor the authorization list ' +
    'are given',
    function () {
      templateContext = {
        person: null,
        authorizations: null
      };

      html = render(templateContext);

      renderedText = $(html).children('div').text().trim();
      expect(renderedText).toEqual('no');
    }
  );

  it(
    'renders the truthy block if a person is listed in authorization list',
    function () {
      var authList = [
        fakeAuthObj({id: 15, email: 'person15@foo.bar'}),
        fakeAuthObj({id: 42, email: 'person42@foo.bar'}),
        fakeAuthObj({id: 101, email: 'person101@foo.bar'})
      ];

      templateContext = {
        person: {id: 42, email: 'person42@foo.bar'},
        authorizations: authList
      };

      html = render(templateContext);

      renderedText = $(html).children('div').text().trim();
      expect(renderedText).toEqual('yes');
    }
  );

  it(
    'renders the falsy block if a person is not listed in authorization list',
    function () {
      var authList = [
        fakeAuthObj({id: 15, email: 'person15@foo.bar'}),
        fakeAuthObj({id: 101, email: 'person101@foo.bar'})
      ];

      templateContext = {
        person: {id: 42, email: 'person42@foo.bar'},
        authorizations: authList
      };

      html = render(templateContext);

      renderedText = $(html).children('div').text().trim();
      expect(renderedText).toEqual('no');
    }
  );
});
