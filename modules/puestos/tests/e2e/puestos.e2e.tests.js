'use strict';

describe('Puestos E2E Tests:', function() {
	describe('Test Puestos page', function() {
		it('Should not include new Puestos', function() {
			browser.get('http://localhost:3000/#!/puestos');
			expect(element.all(by.repeater('puesto in puestos')).count()).toEqual(0);
		});
	});
});
