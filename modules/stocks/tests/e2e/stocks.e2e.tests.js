'use strict';

describe('Stocks E2E Tests:', function() {
	describe('Test Stocks page', function() {
		it('Should not include new Stocks', function() {
			browser.get('http://localhost:3000/#!/stocks');
			expect(element.all(by.repeater('stock in stocks')).count()).toEqual(0);
		});
	});
});
