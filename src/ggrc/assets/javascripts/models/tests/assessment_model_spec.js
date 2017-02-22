/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

describe('CMS.Models.Assessment', function () {
  'use strict';

  describe('before_create() method', function () {
    var assessment;
    var audit;
    var auditWithoutContext;
    var context;
    var program;

    beforeEach(function () {
      assessment = new CMS.Models.Assessment();
      context = new CMS.Models.Context({id: 42});
      program = new CMS.Models.Program({id: 54});
      audit = new CMS.Models.Audit({context: context, program: program});
      auditWithoutContext = new CMS.Models.Audit({program: program});
    });

    it('sets the program and context properties', function () {
      assessment.attr('audit', audit);
      assessment.before_create();
      expect(assessment.context.id).toEqual(context.id);
      expect(assessment.program.id).toEqual(program.id);
    });

    it('throws an error if audit is not defined', function () {
      expect(function () {
        assessment.before_create();
      }).toThrow(new Error('Cannot save assessment, audit not set.'));
    });

    it('throws an error if audit program/context are not defined', function () {
      assessment.attr('audit', auditWithoutContext);
      expect(function () {
        assessment.before_create();
      }).toThrow(new Error(
        'Cannot save assessment, audit context or program not set.'));
    });
  });
});
