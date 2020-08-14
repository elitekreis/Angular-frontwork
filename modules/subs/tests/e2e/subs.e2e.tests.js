'use strict';

describe('Subs E2E Tests:', function() {
	describe('Test Subs page', function() {
		it('Should not include new Subs', function() {
			browser.get('http://localhost:3000/#!/subs');
			expect(element.all(by.repeater('sub in subs')).count()).toEqual(0);
		});
	});
});
