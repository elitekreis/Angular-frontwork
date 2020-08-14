'use strict';

describe('Pedidos E2E Tests:', function() {
	describe('Test Pedidos page', function() {
		it('Should not include new Pedidos', function() {
			browser.get('http://localhost:3000/#!/pedidos');
			expect(element.all(by.repeater('pedido in pedidos')).count()).toEqual(0);
		});
	});
});
