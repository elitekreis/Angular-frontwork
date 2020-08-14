'use strict';

describe('Procesos E2E Tests:', function() {
	describe('Test Procesos page', function() {
		it('Should not include new Procesos', function() {
			browser.get('http://localhost:3000/#!/procesos');
			expect(element.all(by.repeater('proceso in procesos')).count()).toEqual(0);
		});
	});
});
