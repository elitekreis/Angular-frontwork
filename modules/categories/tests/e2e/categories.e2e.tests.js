'use strict';

describe('Categories E2E Tests:', function() {
	describe('Test Categories page', function() {
		it('Should not include new Categories', function() {
			browser.get('http://localhost:3000/#!/categories');
			expect(element.all(by.repeater('category in categories')).count()).toEqual(0);
		});
	});
});
