'use strict';

describe('Entregas E2E Tests:', function() {
	describe('Test Entregas page', function() {
		it('Should not include new Entregas', function() {
			browser.get('http://localhost:3000/#!/entregas');
			expect(element.all(by.repeater('entrega in entregas')).count()).toEqual(0);
		});
	});
});
