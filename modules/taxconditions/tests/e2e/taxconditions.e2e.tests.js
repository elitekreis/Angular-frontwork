'use strict';

describe('Taxconditions E2E Tests:', function() {
	describe('Test Taxconditions page', function() {
		it('Should not include new Taxconditions', function() {
			browser.get('http://localhost:3000/#!/taxconditions');
			expect(element.all(by.repeater('taxcondition in taxconditions')).count()).toEqual(0);
		});
	});
});
