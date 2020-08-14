'use strict';

describe('Servicios E2E Tests:', function () {
  describe('Test Servicios page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/servicios');
      expect(element.all(by.repeater('servicio in servicios')).count()).toEqual(0);
    });
  });
});
