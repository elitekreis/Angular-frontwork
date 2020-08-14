'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Rrhh = mongoose.model('Rrhh');

/**
 * Globals
 */
var user, rrhh;

/**
 * Unit tests
 */
describe('Rrhh Model Unit Tests:', function() {
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
			rrhh = new Rrhh({
				name: 'Rrhh Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return rrhh.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			rrhh.name = '';

			return rrhh.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Rrhh.remove().exec(function(){
			User.remove().exec(function(){
				done();
			});	
		});
	});
});
