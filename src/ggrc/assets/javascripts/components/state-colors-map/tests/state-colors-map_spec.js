/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

describe('GGRC.Components.stateColorsMap', function () {
  'use strict';

  var completedState = 'Completed';
  var completedColor = '#8bc34a';
  var defaultColor = '#bdbdbd';

  describe('in case state is set as "Completed"', function () {
    var viewModel;

    beforeEach(function () {
      viewModel = GGRC.Components.getViewModel('stateColorsMap');
    });

    it('color property should be "#8bc34a"', function () {
      viewModel.attr('state', completedState);
      expect(viewModel.attr('color')).toBe(completedColor);
    });
  });

  describe('in case state is not defined', function () {
    var viewModel;

    beforeEach(function () {
      viewModel = GGRC.Components.getViewModel('stateColorsMap');
    });

    it('color property should be "#bdbdbd"', function () {
      viewModel.attr('state', null);
      expect(viewModel.attr('color')).toBe(defaultColor);
    });
  });

  describe('in case colorsMap is mistakenly defined as null' +
    ' default colorMap should be used ', function () {
    var viewModel;

    beforeEach(function () {
      viewModel = GGRC.Components.getViewModel('stateColorsMap');
    });

    it('and color property should be "#bdbdbd"', function () {
      viewModel.attr('colorsMap', null);
      viewModel.attr('state', null);
      expect(viewModel.attr('color')).toBe(defaultColor);
    });
  });

  describe('in case colorsMap is redefined', function () {
    var viewModel;

    beforeEach(function () {
      viewModel = GGRC.Components.getViewModel('stateColorsMap');
    });

    it('color property should be "#aaa"', function () {
      viewModel.attr('colorsMap', {some: '#aaa'});
      viewModel.attr('state', 'some');
      expect(viewModel.attr('color')).toBe('#aaa');
    });
  });
});
