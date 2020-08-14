'use strict';

describe('Rrhhs E2E Tests:', function() {
	describe('Test Rrhhs page', function() {
		it('Should not include new Rrhhs', function() {
			browser.get('http://localhost:3000/#!/rrhhs');
			expect(element.all(by.repeater('rrhh in rrhhs')).count()).toEqual(0);
		});
	});
});
