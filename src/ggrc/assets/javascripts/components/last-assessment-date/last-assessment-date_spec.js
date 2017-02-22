/*!
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

describe('GGRC.Components.lastAssessmentDate', function () {
  'use strict';

  var Component;  // the component under test

  beforeAll(function () {
    Component = GGRC.Components.get('lastAssessmentDate');
  });

  describe('init() method', function () {
    var componentInst;
    var method;

    describe('for not Snapshot object', function () {
      beforeEach(function () {
        componentInst = {
          viewModel: new can.Map(),
          loadLastAssessment: jasmine.createSpy()
        };
        method = Component.prototype.init.bind(componentInst);
      });

      it('works correct for Control type', function () {
        componentInst.viewModel.attr('instance', {
          type: 'Control',
          id: 123
        });
        method();

        expect(componentInst.loadLastAssessment).toHaveBeenCalled();
      });

      it('works correct for Objective type', function () {
        componentInst.viewModel.attr('instance', {
          type: 'Objective',
          id: 321
        });
        method();

        expect(componentInst.loadLastAssessment).toHaveBeenCalled();
      });

      it('doesn\'t work if instance is empty', function () {
        method();

        expect(componentInst.loadLastAssessment).not.toHaveBeenCalled();
      });

      it('doesn\'t work if type is empty', function () {
        componentInst.viewModel.attr('instance', {
          id: 321
        });
        method();

        expect(componentInst.loadLastAssessment).not.toHaveBeenCalled();
      });

      it('doesn\'t work if id is empty', function () {
        componentInst.viewModel.attr('instance', {
          type: 'Control'
        });
        method();

        expect(componentInst.loadLastAssessment).not.toHaveBeenCalled();
      });

      it('doesn\'t work for not allowed types', function () {
        componentInst.viewModel.attr('instance', {
          type: 'Foo',
          id: 321
        });
        method();

        expect(componentInst.loadLastAssessment).not.toHaveBeenCalled();
      });
    });

    describe('for Snapshot object', function () {
      beforeEach(function () {
        componentInst = {
          viewModel: new can.Map(),
          loadLastAssessment: jasmine.createSpy()
        };
        method = Component.prototype.init.bind(componentInst);
      });

      it('works correct for Control type', function () {
        componentInst.viewModel.attr('instance', {
          snapshot: {
            child_type: 'Control',
            child_id: 123
          }
        });
        method();

        expect(componentInst.loadLastAssessment).toHaveBeenCalled();
      });

      it('works correct for Objective type', function () {
        componentInst.viewModel.attr('instance', {
          snapshot: {
            child_type: 'Objective',
            child_id: 321
          }
        });
        method();

        expect(componentInst.loadLastAssessment).toHaveBeenCalled();
      });

      it('doesn\'t work if instance is empty', function () {
        method();

        expect(componentInst.loadLastAssessment).not.toHaveBeenCalled();
      });

      it('doesn\'t work if type is empty', function () {
        componentInst.viewModel.attr('instance', {
          snapshot: {
            child_id: 321
          }
        });
        method();

        expect(componentInst.loadLastAssessment).not.toHaveBeenCalled();
      });

      it('doesn\'t work for not allowed types', function () {
        componentInst.viewModel.attr('instance', {
          snapshot: {
            child_type: 'Foo',
            child_id: 321
          }
        });
        method();

        expect(componentInst.loadLastAssessment).not.toHaveBeenCalled();
      });
    });
  });

  describe('loadLastAssessment() method', function () {
    var loadLastAssessment;
    var REQUESTED_TYPE = 'Assessment';
    var FILTER_OPTIONS = Object.freeze({
      current: 1,
      pageSize: 1,
      sortBy: 'finished_date',
      sortDirection: 'desc'
    });
    var REQUIRED_FIELDS = Object.freeze(['finished_date']);

    beforeAll(function () {
      spyOn(GGRC.Utils.QueryAPI, 'buildParam');
      spyOn(GGRC.Utils.QueryAPI, 'makeRequest').and.returnValue({
        then: jasmine.createSpy()
      });
    });

    beforeEach(function () {
      var componentInst = {
        viewModel: new can.Map()
      };

      loadLastAssessment = Component.prototype.loadLastAssessment
        .bind(componentInst);
    });

    it('requesting the correct parameters', function () {
      loadLastAssessment('Foo', 123);

      expect(GGRC.Utils.QueryAPI.buildParam)
        .toHaveBeenCalledWith(
          REQUESTED_TYPE,
          FILTER_OPTIONS, {
            type: 'Foo',
            operation: 'relevant',
            id: 123
          },
          REQUIRED_FIELDS);

      expect(GGRC.Utils.QueryAPI.makeRequest).toHaveBeenCalled();
    });
  });
});
