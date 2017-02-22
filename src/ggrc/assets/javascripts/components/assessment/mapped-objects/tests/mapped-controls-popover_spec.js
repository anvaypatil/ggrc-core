/*!
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

describe('GGRC.Components.AssessmentMappedControlsPopover', function () {
  'use strict';

  var viewModel;
  var defaultResponseArr = [{
    Snapshot: {
      values: [
        {revision: {content: {}}},
        {revision: {content: {}}}
      ]
    }
  }, {
    Snapshot: {
      values: []
    }
  }];
  var noDataResponseArr = [{
    Snapshot: {
      values: []
    }
  }, {
    Snapshot: {
      values: []
    }
  }];
  var params = {
    data: [
      {
        object_name: 'Snapshot',
        filters: {
          expression: {
            left: {
              left: 'child_type',
              op: {name: '='},
              right: 'Objective'},
            op: {name: 'AND'},
            right: {
              object_name: 'Snapshot',
              op: {name: 'relevant'},
              ids: ['1']
            }
          },
          keys: [],
          order_by: {
            keys: [],
            order: '',
            compare: null
          }
        },
        fields: ['revision']
      }, {
        object_name: 'Snapshot',
        filters: {
          expression: {
            left: {
              left: 'child_type',
              op: {name: '='},
              right: 'Regulation'
            },
            op: {name: 'AND'},
            right: {
              object_name: 'Snapshot',
              op: {name: 'relevant'},
              ids: ['1']
            }
          },
          keys: [],
          order_by: {
            keys: [],
            order: '',
            compare: null
          }
        },
        fields: ['revision']
      }]
  };

  beforeEach(function () {
    viewModel = new GGRC.Components
      .getViewModel('assessmentMappedControlsPopover');
  });

  describe('By default shouldn\'t load any data', function () {
    it('"objectives" and ' +
      ' "regulations" array should zero length' +
      '"performLoading" should be false', function () {
      expect(viewModel.attr('performLoading')).toEqual(false);
      expect(viewModel.attr('objectives').length).toEqual(0);
      expect(viewModel.attr('regulations').length).toEqual(0);
      expect(viewModel.attr('instanceId')).toEqual(0);
    });
  });

  describe('On "performLoading" attribute set to true', function () {
    beforeEach(function () {
      spyOn(viewModel, 'loadItems');

      viewModel.attr('performLoading', true);
    });

    it('should start loading of required data', function () {
      expect(viewModel.loadItems).toHaveBeenCalled();
    });

    it('should start loading of required data', function () {
      expect(viewModel.loadItems.calls.count()).toEqual(1);
    });
  });

  describe('On "performLoading" attribute set to false', function () {
    beforeEach(function () {
      spyOn(viewModel, 'loadItems');

      viewModel.attr('performLoading', false);
    });

    it('should start loading of required data', function () {
      expect(viewModel.loadItems.calls.count()).toEqual(0);
    });
  });

  describe('On "instanceId" attribute set to 0 (no modification)' +
    ' and "performLoading" attribute set to true', function () {
    beforeEach(function () {
      spyOn(viewModel, 'setItems');

      viewModel.attr('instanceId', 0);
      viewModel.attr('performLoading', true);
    });

    it('should start loading of required data', function () {
      expect(viewModel.setItems).toHaveBeenCalled();
    });

    it('should start loading of required data', function () {
      expect(viewModel.setItems).toHaveBeenCalledWith(noDataResponseArr);
    });
  });

  describe('#setItems', function () {
    it('should set correct objectives and regulations arrays', function () {
      viewModel.setItems(defaultResponseArr);
      expect(viewModel.attr('objectives').length).toEqual(2);
      expect(viewModel.attr('regulations').length).toEqual(0);
    });
  });
  describe('#getParams', function () {
    it('should set correct params object', function () {
      var result = JSON.stringify(viewModel.getParams(1));
      expect(result).toBe(JSON.stringify(params));
    });
  });
});
