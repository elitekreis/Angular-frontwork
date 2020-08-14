'use strict';

describe('Compras E2E Tests:', function() {
	describe('Test Compras page', function() {
		it('Should not include new Compras', function() {
			browser.get('http://localhost:3000/#!/compras');
			expect(element.all(by.repeater('compra in compras')).count()).toEqual(0);
		});
	});
});
