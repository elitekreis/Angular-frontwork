'use strict';

describe('Personas E2E Tests:', function() {
	describe('Test Personas page', function() {
		it('Should not include new Personas', function() {
			browser.get('http://localhost:3000/#!/personas');
			expect(element.all(by.repeater('persona in personas')).count()).toEqual(0);
		});
	});
});
