'use strict';

describe('Comprobantes E2E Tests:', function() {
	describe('Test Comprobantes page', function() {
		it('Should not include new Comprobantes', function() {
			browser.get('http://localhost:3000/#!/comprobantes');
			expect(element.all(by.repeater('comprobante in comprobantes')).count()).toEqual(0);
		});
	});
});
