'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Taxcondition = mongoose.model('Taxcondition');

/**
 * Globals
 */
var user, taxcondition;

/**
 * Unit tests
 */
describe('Taxcondition Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			taxcondition = new Taxcondition({
				name: 'Taxcondition Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return taxcondition.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			taxcondition.name = '';

			return taxcondition.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Taxcondition.remove().exec(function(){
			User.remove().exec(function(){
				done();
			});	
		});
	});
});
