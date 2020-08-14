'use strict';

describe('Condicionventas E2E Tests:', function() {
	describe('Test Condicionventas page', function() {
		it('Should not include new Condicionventas', function() {
			browser.get('http://localhost:3000/#!/condicionventas');
			expect(element.all(by.repeater('condicionventa in condicionventas')).count()).toEqual(0);
		});
	});
});
