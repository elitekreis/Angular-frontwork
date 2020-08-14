'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Costcenter = mongoose.model('Costcenter');

/**
 * Globals
 */
var user, costcenter;

/**
 * Unit tests
 */
describe('Costcenter Model Unit Tests:', function() {
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
			costcenter = new Costcenter({
				name: 'Costcenter Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return costcenter.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			costcenter.name = '';

			return costcenter.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Costcenter.remove().exec(function(){
			User.remove().exec(function(){
				done();
			});	
		});
	});
});
