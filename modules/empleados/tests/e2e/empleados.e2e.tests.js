'use strict';

describe('Empleados E2E Tests:', function () {
  describe('Test Empleados page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/empleados');
      expect(element.all(by.repeater('empleado in empleados')).count()).toEqual(0);
    });
  });
});
