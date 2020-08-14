'use strict';

describe('Enterprises E2E Tests:', function() {
	describe('Test Enterprises page', function() {
		it('Should not include new Enterprises', function() {
			browser.get('http://localhost:3000/#!/enterprises');
			expect(element.all(by.repeater('enterprise in enterprises')).count()).toEqual(0);
		});
	});
});
