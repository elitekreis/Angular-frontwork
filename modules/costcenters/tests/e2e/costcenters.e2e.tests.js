'use strict';

describe('Costcenters E2E Tests:', function() {
	describe('Test Costcenters page', function() {
		it('Should not include new Costcenters', function() {
			browser.get('http://localhost:3000/#!/costcenters');
			expect(element.all(by.repeater('costcenter in costcenters')).count()).toEqual(0);
		});
	});
});
