'use strict';

describe('Ventas E2E Tests:', function() {
	describe('Test Ventas page', function() {
		it('Should not include new Ventas', function() {
			browser.get('http://localhost:3000/#!/ventas');
			expect(element.all(by.repeater('venta in ventas')).count()).toEqual(0);
		});
	});
});
