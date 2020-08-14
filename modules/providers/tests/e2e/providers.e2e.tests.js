'use strict';

describe('Providers E2E Tests:', function() {
	describe('Test Providers page', function() {
		it('Should not include new Providers', function() {
			browser.get('http://localhost:3000/#!/providers');
			expect(element.all(by.repeater('provider in providers')).count()).toEqual(0);
		});
	});
});
