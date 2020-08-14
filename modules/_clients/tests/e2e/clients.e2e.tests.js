'use strict';

describe('Clients E2E Tests:', function() {
	describe('Test Clients page', function() {
		it('Should not include new Clients', function() {
			browser.get('http://localhost:3000/#!/clients');
			expect(element.all(by.repeater('client in clients')).count()).toEqual(0);
		});
	});
});
