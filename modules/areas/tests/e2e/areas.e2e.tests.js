'use strict';

describe('Areas E2E Tests:', function() {
	describe('Test Areas page', function() {
		it('Should not include new Areas', function() {
			browser.get('http://localhost:3000/#!/areas');
			expect(element.all(by.repeater('area in areas')).count()).toEqual(0);
		});
	});
});
