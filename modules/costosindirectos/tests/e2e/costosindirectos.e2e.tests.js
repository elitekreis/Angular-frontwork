'use strict';

describe('Costosindirectos E2E Tests:', function () {
  describe('Test Costosindirectos page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/costosindirectos');
      expect(element.all(by.repeater('costosindirecto in costosindirectos')).count()).toEqual(0);
    });
  });
});
