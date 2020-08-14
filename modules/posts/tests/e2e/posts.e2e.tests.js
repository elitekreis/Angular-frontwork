'use strict';

describe('Posts E2E Tests:', function() {
	describe('Test Posts page', function() {
		it('Should not include new Posts', function() {
			browser.get('http://localhost:3000/#!/posts');
			expect(element.all(by.repeater('post in posts')).count()).toEqual(0);
		});
	});
});
