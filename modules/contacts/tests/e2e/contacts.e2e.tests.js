'use strict';

describe('Contacts E2E Tests:', function() {
	describe('Test Contacts page', function() {
		it('Should not include new Contacts', function() {
			browser.get('http://localhost:3000/#!/contacts');
			expect(element.all(by.repeater('contact in contacts')).count()).toEqual(0);
		});
	});
});
