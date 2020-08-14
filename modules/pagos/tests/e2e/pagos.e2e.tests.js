'use strict';

describe('Pagos E2E Tests:', function () {
  describe('Test Pagos page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/pagos');
      expect(element.all(by.repeater('pago in pagos')).count()).toEqual(0);
    });
  });
});
